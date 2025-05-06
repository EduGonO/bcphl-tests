// pages/api/save-file.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const REPO   = process.env.GITHUB_REPO!;
const TOKEN  = process.env.GITHUB_TOKEN!;
const BRANCH = process.env.GITHUB_BRANCH || "main";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Auth
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).end();

  // 2) Must be POST
  if (req.method !== "POST") return res.status(405).end();

  // 3) Validate payload
  const { cat, slug, body } = req.body as {
    cat: string;
    slug: string;
    body: string;
  };
  if (!cat || !slug || typeof body !== "string") {
    return res.status(400).end();
  }

  // 4) Find the actual markdown file inside texts/<cat>/<slug>/
  const dir = path.join(process.cwd(), "texts", cat, slug);
  if (!fs.existsSync(dir)) {
    return res.status(404).end();
  }
  // list all .md files
  const mdFiles = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  if (mdFiles.length === 0) {
    return res.status(404).end();
  }
  // prefer <slug>.md, else first
  const chosenMd = mdFiles.includes(`${slug}.md`)
    ? `${slug}.md`
    : mdFiles[0];
  const filePath = `texts/${cat}/${slug}/${chosenMd}`;

  try {
    // 5) Fetch the SHA for updates (if it exists)
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

    let sha: string | undefined;
    if (metaRes.ok) {
      const metaJson = await metaRes.json();
      sha = metaJson.sha;
    } else if (metaRes.status === 404) {
      // file doesn't exist → we'll create it
      sha = undefined;
    } else {
      console.error("Error fetching file SHA:", await metaRes.text());
      return res.status(500).end();
    }

    // 6) Commit (create or update)
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
          sha, // if undefined, GitHub will create the file
        }),
      }
    );
    if (!commitRes.ok) {
      console.error("Error committing file:", await commitRes.text());
      return res.status(500).end();
    }

    // 7) All good
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Unexpected save-file error:", err);
    return res.status(500).end();
  }
}