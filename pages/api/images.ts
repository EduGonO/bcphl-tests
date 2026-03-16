import type { NextApiRequest, NextApiResponse } from "next";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { getManifest, putManifest } from "../../lib/manifest";
import { r2BucketName, r2Client } from "../../lib/r2";

const sanitizeSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9-_/]/g, "-").replace(/\.{2,}/g, "-").replace(/^\/+|\/+$/g, "");

const getSlug = (input: string | string[] | undefined): string | null => {
  if (typeof input !== "string") return null;
  const safe = sanitizeSlug(input);
  return safe || null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const slug = getSlug(req.method === "GET" ? req.query.slug : req.body.slug);
  if (!slug) {
    return res.status(400).json({ error: "Slug is required" });
  }

  try {
    if (req.method === "GET") {
      const manifest = await getManifest(slug);
      return res.status(200).json(manifest);
    }

    if (req.method === "DELETE") {
      const key = req.body?.key;
      if (typeof key !== "string" || !key) {
        return res.status(400).json({ error: "Image key is required" });
      }

      await r2Client.send(new DeleteObjectCommand({ Bucket: r2BucketName, Key: key }));
      const manifest = await getManifest(slug);
      const nextManifest = manifest.filter((item) => item.key !== key);
      await putManifest(slug, nextManifest);
      return res.status(200).json({ success: true });
    }

    if (req.method === "PATCH") {
      const key = req.body?.key;
      if (typeof key !== "string" || !key) {
        return res.status(400).json({ error: "Image key is required" });
      }

      const manifest = await getManifest(slug);
      const nextManifest = manifest.map((item) => (
        item.key === key ? { ...item, isUsed: true } : item
      ));
      await putManifest(slug, nextManifest);
      const updated = nextManifest.find((item) => item.key === key) ?? null;
      return res.status(200).json({ success: true, image: updated });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("images api error", error);
    return res.status(500).json({ error: "Image operation failed" });
  }
}
