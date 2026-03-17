import { S3Client } from "@aws-sdk/client-s3";

export const createR2Client = (): S3Client => {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 configuration environment variables.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const getR2PublicUrl = (objectKey: string): string => {
  const publicBase = process.env.R2_PUBLIC_URL;
  if (!publicBase) {
    throw new Error("Missing R2_PUBLIC_URL environment variable.");
  }

  const normalizedBase = publicBase.replace(/\/$/, "");
  return `${normalizedBase}/${objectKey}`;
};
