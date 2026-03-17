import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { createR2Client, getR2PublicUrl } from "../../lib/r2";

type UploadBody = {
  filename?: string;
  contentType?: string;
  data?: string;
};

const sanitizeFilename = (filename: string): string =>
  filename
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { filename, contentType, data } = req.body as UploadBody;
  if (!filename || !contentType || !data) {
    return res.status(400).json({ error: "Missing upload payload" });
  }

  const bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName) {
    return res.status(500).json({ error: "Missing R2 bucket configuration" });
  }

  try {
    const base64Payload = data.includes(",") ? (data.split(",").pop() as string) : data;
    const buffer = Buffer.from(base64Payload, "base64");
    const extension = filename.split(".").pop()?.toLowerCase() ?? "bin";
    const key = `editor/${Date.now()}-${sanitizeFilename(filename)}.${extension}`;

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
    return res.status(500).json({ error: "Failed to upload image" });
  }
}
