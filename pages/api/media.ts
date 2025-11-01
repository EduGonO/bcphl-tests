import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import fs from "fs";
import path from "path";
import { findArticleRecord } from "../../lib/articleService";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif)$/i;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { cat, slug } = req.query;
  if (typeof cat !== "string" || typeof slug !== "string") return res.status(400).end();

  const record = findArticleRecord(cat, slug);
  if (!record) {
    return res.status(404).end();
  }

  const images = new Set<string>();

  record.article.media.forEach((item) => {
    if (typeof item === "string" && item.trim()) {
      images.add(item);
    }
  });

  if (record.sourceType === "legacy") {
    const legacyDir = path.dirname(record.absolutePath);
    if (fs.existsSync(legacyDir)) {
      fs.readdirSync(legacyDir)
        .filter((file) => IMAGE_EXT.test(file))
        .forEach((file) => {
          images.add(path.posix.join(record.publicBasePath, file));
        });
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "media", cat, slug);
  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir)
      .filter((file) => IMAGE_EXT.test(file))
      .forEach((file) => {
        images.add(path.posix.join("/media", cat, slug, file));
      });
  }

  res.status(200).json(Array.from(images));
}
