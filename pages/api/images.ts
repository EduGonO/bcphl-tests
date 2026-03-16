import type { NextApiRequest, NextApiResponse } from "next";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { r2 } from "../../lib/r2";

const getManifestKey = (slug: string) => `articles/${slug}/manifest.json`;

const readStream = async (stream: any) => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
};

const getManifest = async (slug: string): Promise<string[]> => {
  try {
    const result = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: getManifestKey(slug),
      })
    );
    if (!result.Body) return [];
    const content = await readStream(result.Body);
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveManifest = async (slug: string, urls: string[]) => {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: getManifestKey(slug),
      Body: JSON.stringify(urls),
      ContentType: "application/json",
    })
  );
};

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const slug = typeof req.query.slug === "string" ? req.query.slug : req.body?.slug;
  if (!slug) return res.status(400).json({ error: "slug required" });

  if (req.method === "GET") {
    const urls = await getManifest(slug);
    return res.status(200).json(urls);
  }

  if (req.method === "POST") {
    const { name, data } = req.body as { name: string; data: string };
    const filename = `${Date.now()}-${name}`;
    const key = `articles/${slug}/${filename}`;
    const base64Payload = data.includes(",") ? data.split(",").pop() || "" : data;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(base64Payload, "base64"),
      })
    );

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;
    const urls = await getManifest(slug);
    urls.push(url);
    await saveManifest(slug, urls);

    return res.status(200).json({ url });
  }

  if (req.method === "DELETE") {
    const { url } = req.body as { url: string };
    const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, "");

    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      })
    );

    const urls = (await getManifest(slug)).filter((item) => item !== url);
    await saveManifest(slug, urls);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
