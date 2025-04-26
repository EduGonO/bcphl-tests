import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { cat, slug, body } = req.body as { cat: string; slug: string; body: string };
  const file = path.join(process.cwd(), "texts", cat, `${slug}.md`);
  try {
    fs.writeFileSync(file, body, "utf-8");
    res.status(200).end();
  } catch {
    res.status(500).end();
  }
}