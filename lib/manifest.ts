import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./r2";

interface ManifestEntry {
  key: string;
  url: string;
  filename: string;
  uploadedAt: string;
  isUsed: boolean;
}

interface Manifest {
  slug: string;
  images: ManifestEntry[];
}

const bucket = () => process.env.R2_BUCKET_NAME!;
const baseUrl = () => (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");

export async function getManifest(slug: string): Promise<Manifest> {
  const key = `articles/${slug}/manifest.json`;
  try {
    const res = await r2Client.send(
      new GetObjectCommand({ Bucket: bucket(), Key: key })
    );
    const body = await res.Body!.transformToString();
    return JSON.parse(body) as Manifest;
  } catch {
    return { slug, images: [] };
  }
}

export async function putManifest(
  slug: string,
  manifest: Manifest
): Promise<void> {
  const key = `articles/${slug}/manifest.json`;
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: JSON.stringify(manifest),
      ContentType: "application/json",
    })
  );
}

export type { Manifest, ManifestEntry };
