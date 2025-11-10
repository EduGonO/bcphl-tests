import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { findArticleRecord } from "../../lib/articleService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { cat, slug } = req.query;
  if (typeof cat !== "string" || typeof slug !== "string") return res.status(400).end();

  const record = await findArticleRecord(cat, slug);
  if (!record) {
    return res.status(404).end();
  }

  const images = Array.from(
    new Set(record.article.media.filter((item) => typeof item === "string" && item.trim()))
  );

  res.status(200).json(images);
}
