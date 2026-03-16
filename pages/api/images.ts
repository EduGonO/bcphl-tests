import type { NextApiRequest, NextApiResponse } from "next";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "../../lib/r2";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { slug } = req.query;
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "slug is required" });
    }
    const prefix = `articles/${slug}/`;
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME!,
      Prefix: prefix,
    });
    const result = await r2Client.send(command);
    const baseUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
    const images = (result.Contents ?? []).map((obj) => ({
      key: obj.Key!,
      url: `${baseUrl}/${obj.Key}`,
    }));
    return res.status(200).json({ images });
  }

  if (req.method === "DELETE") {
    const { key } = req.body as { key: string };
    if (!key) {
      return res.status(400).json({ error: "key is required" });
    }
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    );
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
