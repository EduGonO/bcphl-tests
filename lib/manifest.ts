import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./r2";

export interface ManifestEntry {
  key: string;
  url: string;
  filename: string;
  uploadedAt: string;
  isUsed: boolean;
}

export interface Manifest {
  slug: string;
  images: ManifestEntry[];
}

const bucket = () => process.env.R2_BUCKET_NAME!;

export async function getManifest(slug: string): Promise<Manifest> {
  try {
    const res = await r2Client.send(
      new GetObjectCommand({ Bucket: bucket(), Key: `articles/${slug}/manifest.json` })
    );
    const body = await res.Body!.transformToString();
    return JSON.parse(body) as Manifest;
  } catch {
    return { slug, images: [] };
  }
}

export async function putManifest(slug: string, manifest: Manifest): Promise<void> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: `articles/${slug}/manifest.json`,
      Body: JSON.stringify(manifest),
      ContentType: "application/json",
    })
  );
}
