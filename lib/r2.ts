import { S3Client } from "@aws-sdk/client-s3";

const requiredEnv = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
] as const;

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[r2] Missing environment variable: ${key}`);
  }
});

export const r2BucketName = process.env.R2_BUCKET_NAME ?? "";
export const r2PublicUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

