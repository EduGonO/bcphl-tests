import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "../../lib/r2";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Expect JSON body: { name: string, type: string, data: base64string }
  const { name, type, data } = req.body as {
    name: string;
    type: string;
    data: string;
  };

  if (!data) {
    return res.status(400).json({ error: "No file data provided" });
  }

  const buffer = Buffer.from(data, "base64");
  const key = `uploads/${Date.now()}-${name ?? "upload"}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: type ?? "application/octet-stream",
    })
  );

  // Strip trailing slash from base URL to avoid double-slash in the final URL.
  const baseUrl = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/,  "");
  const url = `${baseUrl}/${key}`;
  return res.status(200).json({ url });
}
