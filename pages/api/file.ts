import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs"; import path from "path";
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { cat, slug } = req.query as { cat: string; slug: string };
  const file = path.join(process.cwd(), "texts", cat, `${slug}.md`);
  try {
    const data = fs.readFileSync(file, "utf-8");
    res.status(200).send(data);
  } catch {
    res.status(404).end();
  }
}