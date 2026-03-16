import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2BucketName, r2Client } from "./r2";

export type ManifestImage = {
  key: string;
  url: string;
  filename: string;
  uploadedAt: string;
  isUsed: boolean;
};

const streamToString = async (stream: unknown): Promise<string> => {
  if (!stream) return "";

  if (typeof (stream as { transformToString?: () => Promise<string> }).transformToString === "function") {
    return (stream as { transformToString: () => Promise<string> }).transformToString();
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
};

const manifestKey = (slug: string) => `articles/${slug}/manifest.json`;

export const getManifest = async (slug: string): Promise<ManifestImage[]> => {
  try {
    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: r2BucketName,
        Key: manifestKey(slug),
      })
    );
    const content = await streamToString(response.Body);
    if (!content.trim()) return [];
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is ManifestImage => (
      Boolean(entry)
      && typeof entry.key === "string"
      && typeof entry.url === "string"
      && typeof entry.filename === "string"
      && typeof entry.uploadedAt === "string"
      && typeof entry.isUsed === "boolean"
    ));
  } catch (error) {
    if ((error as { name?: string }).name === "NoSuchKey") {
      return [];
    }
    throw error;
  }
};

export const putManifest = async (slug: string, manifest: ManifestImage[]): Promise<void> => {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: r2BucketName,
      Key: manifestKey(slug),
      ContentType: "application/json",
      Body: JSON.stringify(manifest, null, 2),
    })
  );
};
