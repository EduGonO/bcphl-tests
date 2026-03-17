import type { NextApiRequest, NextApiResponse } from "next";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getManifest, putManifest } from "../../lib/manifest";
import { r2BucketName, r2Client } from "../../lib/r2";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const manifest = await getManifest();
      return res.status(200).json(manifest);
    }

    if (req.method === "DELETE") {
      const key = req.body?.key;
      if (typeof key !== "string" || !key) {
        return res.status(400).json({ error: "Image key is required" });
      }

      await r2Client.send(new DeleteObjectCommand({ Bucket: r2BucketName, Key: key }));
      const manifest = await getManifest();
      await putManifest(manifest.filter((item) => item.key !== key));
      return res.status(200).json({ success: true });
    }

    if (req.method === "PATCH") {
      const key = req.body?.key;
      if (typeof key !== "string" || !key) {
        return res.status(400).json({ error: "Image key is required" });
      }

      const manifest = await getManifest();
      const nextManifest = manifest.map((item) =>
        item.key === key ? { ...item, isUsed: true } : item
      );
      await putManifest(nextManifest);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("images api error", error);
    return res.status(500).json({ error: "Image operation failed" });
  }
}
