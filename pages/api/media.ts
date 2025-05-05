import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif)$/i;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  const { cat, slug } = req.query;
  if (typeof cat !== "string" || typeof slug !== "string") return res.status(400).end();

  const dir = path.join(process.cwd(), "texts", cat, slug);
  if (!fs.existsSync(dir)) return res.status(404).end();

  const files = fs.readdirSync(dir).filter(f => IMAGE_EXT.test(f));
  const paths = files.map(f => `/texts/${cat}/${slug}/${f}`); // public URL
  res.status(200).json(paths);
}
