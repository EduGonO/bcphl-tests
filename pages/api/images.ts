import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { createR2Client, getR2PublicUrl } from "../../lib/r2";

// Raise body limit to 10 MB so large images don't cause a 413 before the handler runs.
// The default 4 MB limit causes Next.js to return a non-JSON error response,
// which makes res.json() throw "The string did not match the expected pattern".
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

type UploadBody = {
  filename?: string;
  contentType?: string;
  data?: string;
  slug?: string;
};

const sanitizeFilename = (filename: string): string =>
  filename
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

const sanitizeSlug = (slug: string): string =>
  slug
    .toLowerCase()
    .replace(/[^a-z0-9\/-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .slice(0, 120);

/**
 * Extract the raw base64 payload from a data URI or a plain base64 string.
 * Uses indexOf to find the FIRST comma — more robust than split(",").pop()
 * because split splits on every comma whereas indexOf is unambiguous.
 *
 * data:image/jpeg;base64,/9j/4AAQ...  →  /9j/4AAQ...
 * /9j/4AAQ...                          →  /9j/4AAQ...  (already stripped)
 */
const extractBase64 = (data: string): string => {
  const commaIndex = data.indexOf(",");
  return commaIndex !== -1 ? data.slice(commaIndex + 1) : data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { filename, contentType, data, slug } = req.body as UploadBody;
  if (!filename || !contentType || !data) {
    return res.status(400).json({ error: "Missing upload payload" });
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    return res.status(500).json({ error: "Missing R2 bucket configuration" });
  }

  try {
    const base64Payload = extractBase64(data);
    const buffer = Buffer.from(base64Payload, "base64");
    const extension = filename.split(".").pop()?.toLowerCase() ?? "bin";
    const normalizedSlug = slug ? sanitizeSlug(slug) : "";
    const folder = normalizedSlug || "unsorted";
    const key = `images/${folder}/${Date.now()}-${sanitizeFilename(filename)}.${extension}`;

    const r2Client = createR2Client();

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    const url = getR2PublicUrl(key);
    return res.status(200).json({ url, key });
  } catch (error) {
    console.error("R2 upload failed", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return res.status(500).json({ error: message });
  }
}
