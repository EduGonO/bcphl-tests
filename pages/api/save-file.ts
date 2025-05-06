// pages/api/save-file.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const REPO   = process.env.GITHUB_REPO!;    // e.g. "YourUser/your-repo"
const TOKEN  = process.env.GITHUB_TOKEN!;   // PAT with "repo" scope
const BRANCH = process.env.GITHUB_BRANCH || "main";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) auth
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  // 2) only POST
  if (req.method !== "POST") return res.status(405).end();

  // 3) validate payload
  const { cat, slug, body } = req.body as {
    cat: string;
    slug: string;
    body: string;
  };
  if (!cat || !slug || typeof body !== "string") return res.status(400).end();

  // 4) determine file path in repo
  const filePath = `texts/${cat}/${slug}/${slug}.md`;

  try {
    // 5) fetch existing file metadata to get its SHA
    const metaRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(
        filePath
      )}?ref=${BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!metaRes.ok) {
      console.error("Failed to fetch SHA:", await metaRes.text());
      return res.status(500).end();
    }
    const { sha } = await metaRes.json();

    // 6) send the update commit
    const commitRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(
        filePath
      )}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
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
    if (!commitRes.ok) {
      console.error("Failed to commit file:", await commitRes.text());
      return res.status(500).end();
    }

    // 7) done
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("save-file error:", err);
    return res.status(500).end();
  }
}