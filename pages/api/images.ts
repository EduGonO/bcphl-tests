import type { NextApiRequest, NextApiResponse } from "next";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "../../lib/r2";
import { getManifest, putManifest } from "../../lib/manifest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET ?slug= — return manifest image list
  if (req.method === "GET") {
    const { slug } = req.query;
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "slug is required" });
    }
    const manifest = await getManifest(slug);
    return res.status(200).json({ images: manifest.images });
  }

  // DELETE { key, slug } — remove from R2 and from manifest
  if (req.method === "DELETE") {
    const { key, slug } = req.body as { key: string; slug: string };
    if (!key) {
      return res.status(400).json({ error: "key is required" });
    }
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    );
    if (slug) {
      const manifest = await getManifest(slug);
      manifest.images = manifest.images.filter((img) => img.key !== key);
      await putManifest(slug, manifest);
    }
    return res.status(200).json({ success: true });
  }

  // PATCH { key, slug } — mark image as isUsed: true in manifest
  if (req.method === "PATCH") {
    const { key, slug } = req.body as { key: string; slug: string };
    if (!key || !slug) {
      return res.status(400).json({ error: "key and slug are required" });
    }
    const manifest = await getManifest(slug);
    const entry = manifest.images.find((img) => img.key === key);
    if (entry) {
      entry.isUsed = true;
      await putManifest(slug, manifest);
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
