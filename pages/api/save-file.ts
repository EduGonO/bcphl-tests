import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const REPO   = process.env.GITHUB_REPO!;
const TOKEN  = process.env.GITHUB_TOKEN!;
const BRANCH = process.env.GITHUB_BRANCH || "main";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  // 1) Fetch current file to get its SHA
  const metaResp = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(
      filePath
    )}?ref=${BRANCH}`,
    {
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );
  if (!metaResp.ok) {
    console.error("GitHub meta fetch failed", await metaResp.text());
    return res.status(500).end();
  }
  const { sha } = await metaResp.json();

  // 2) Commit the new content
  const commitResp = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(
      filePath
    )}`,
    {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `Edit ${cat}/${slug}`,
        content: Buffer.from(body, "utf8").toString("base64"),
        branch: BRANCH,
        sha: sha, 
      }),
    }
  );
  if (!commitResp.ok) {
    console.error("GitHub commit failed", await commitResp.text());
    return res.status(500).end();
  }

  res.status(200).json({ ok: true });
}