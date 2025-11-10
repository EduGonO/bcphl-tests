import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { clearArticleCache } from "../../lib/articleService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();
  if (req.method !== "POST") return res.status(405).end();

  clearArticleCache();

  return res.status(410).json({
    error: "La modification des articles via les fichiers Markdown n’est plus disponible.",
  });
}