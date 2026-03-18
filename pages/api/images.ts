import type { NextApiRequest, NextApiResponse } from "next";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { createR2Client, getR2PublicUrl } from "../../lib/r2";

// Raise body limit to 10 MB so large images don't cause a 413 before the
// handler runs. The default 4 MB limit causes Next.js to return a non-JSON
// error response, making res.json() throw a DOMException on the client.
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

type DeleteBody = {
  url?: string;
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
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    return handlePost(req, res);
  }

  if (req.method === "DELETE") {
    return handleDelete(req, res);
  }

  res.setHeader("Allow", "POST,DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
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

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body as DeleteBody;
  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  const publicBase = process.env.R2_PUBLIC_URL;
  if (!publicBase) {
    return res.status(500).json({ error: "Missing R2_PUBLIC_URL" });
  }

  const normalizedBase = publicBase.replace(/\/$/, "");

  if (!url.startsWith(normalizedBase)) {
    // Not an R2-managed URL (e.g. an old storage path). Nothing to delete on R2;
    // return 200 so the caller can still clear the Supabase field cleanly.
    return res.status(200).json({ deleted: false, reason: "Not an R2-managed URL; no action taken" });
  }

  // Derive the object key by stripping the public base URL prefix
  const key = url.slice(normalizedBase.length).replace(/^\//, "");
  if (!key) {
    return res.status(400).json({ error: "Cannot derive R2 key from URL" });
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    return res.status(500).json({ error: "Missing R2 bucket configuration" });
  }

  try {
    const r2Client = createR2Client();
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
    return res.status(200).json({ deleted: true, key });
  } catch (error) {
    console.error("R2 delete failed", error);
    const message = error instanceof Error ? error.message : "Failed to delete image";
    return res.status(500).json({ error: message });
  }
}
