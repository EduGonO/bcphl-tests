import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { getManifest, putManifest } from "../../lib/manifest";
import { r2BucketName, r2Client, r2PublicUrl } from "../../lib/r2";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const sanitizeSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9-_/]/g, "-").replace(/\.{2,}/g, "-").replace(/^\/+|\/+$/g, "");
const sanitizeFilename = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.{2,}/g, "-");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { name, type, data, slug } = req.body as {
      name?: string;
      type?: string;
      data?: string;
      slug?: string;
    };

    if (!name || !type || !data || !slug) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const safeSlug = sanitizeSlug(slug);
    const safeName = sanitizeFilename(name);
    if (!safeSlug || !safeName) {
      return res.status(400).json({ error: "Invalid slug or filename" });
    }

    const base64Payload = data.includes(",") ? data.split(",").pop() ?? "" : data;
    const buffer = Buffer.from(base64Payload, "base64");

    const key = `articles/${safeSlug}/${Date.now()}-${safeName}`;
    await r2Client.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: key,
        Body: buffer,
        ContentType: type,
      })
    );

    const url = `${r2PublicUrl}/${key}`;
    const manifest = await getManifest(safeSlug);
    manifest.push({
      key,
      url,
      filename: safeName,
      uploadedAt: new Date().toISOString(),
      isUsed: false,
    });
    await putManifest(safeSlug, manifest);

    return res.status(200).json({ url, key });
  } catch (error) {
    console.error("upload error", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
