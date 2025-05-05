import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();
  if (req.method !== "POST") return res.status(405).end();

  const { cat, slug, body } = req.body as { cat: string; slug: string; body: string };
  if (!cat || !slug || typeof body !== "string") return res.status(400).end();

  const dir = path.join(process.cwd(), "texts", cat, slug);
  if (!fs.existsSync(dir)) return res.status(404).end();

  const md = path.join(dir, `${slug}.md`);
  fs.writeFileSync(md, body);
  res.status(200).json({ ok: true });
}
