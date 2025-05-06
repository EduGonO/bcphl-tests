// pages/api/save-file.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const REPO   = process.env.GITHUB_REPO!;
const TOKEN  = process.env.GITHUB_TOKEN!;
const BRANCH = process.env.GITHUB_BRANCH || "main";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("save-file method:", req.method);
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  if (req.method !== "POST") return res.status(405).end();

  const { cat, slug, body } = req.body as {
    cat: string;
    slug: string;
    body: string;
  };
  if (!cat || !slug || typeof body !== "string") return res.status(400).end();

  const filePath = `texts/${cat}/${slug}/${slug}.md`;

  try {
    // 1) get current file SHA
    const metaRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(
        filePath
      )}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `token ${TOKEN}`,
          Accept:        "application/vnd.github.v3+json",
        },
      }
    );
    if (!metaRes.ok) {
      console.error("Failed to fetch SHA:", await metaRes.text());
      return res.status(500).end();
    }
    const { sha } = await metaRes.json();

    // 2) commit updated content
    const commitRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(
        filePath
      )}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${TOKEN}`,
          Accept:        "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Edit ${cat}/${slug}`,
          content: Buffer.from(body, "utf8").toString("base64"),
          branch:  BRANCH,
          sha,
        }),
      }
    );
    if (!commitRes.ok) {
      console.error("Failed to commit:", await commitRes.text());
      return res.status(500).end();
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("save-file error:", err);
    return res.status(500).end();
  }
}