import type { NextApiRequest, NextApiResponse } from "next";
import {
  formatSupabaseError,
  INTRO_TITLES,
  loadSupabaseIntroEntries,
} from "../../../lib/supabase/content";
import { getSupabaseServerClient } from "../../../lib/supabase/serverClient";
import type { SupabaseIntroEntry } from "../../../types/supabase";

const ensureClient = () => {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error("Supabase n’est pas configuré. Ajoutez SUPABASE_URL et SUPABASE_KEY.");
  }
  return client;
};

const parsePayload = (req: NextApiRequest) => {
  const body = req.body ?? {};
  const articleId = body.articleId ? String(body.articleId) : "";
  const bodyMarkdown = body.bodyMarkdown ? String(body.bodyMarkdown) : "";
  const bodyHtml = typeof body.bodyHtml === "string" ? body.bodyHtml : null;
  const bodyJson = typeof body.bodyJson === "string" ? body.bodyJson : null;
  return { articleId, bodyMarkdown, bodyHtml, bodyJson };
};

type IntroResponse = { entries: SupabaseIntroEntry[] } | { error: string };

const handleGet = async (res: NextApiResponse<IntroResponse>) => {
  try {
    const supabase = ensureClient();
    const entries = await loadSupabaseIntroEntries(supabase);
    return res.status(200).json({ entries });
  } catch (error) {
    return res.status(500).json({ error: formatSupabaseError(error) });
  }
};

const handlePut = async (req: NextApiRequest, res: NextApiResponse<IntroResponse>) => {
  const { articleId, bodyMarkdown, bodyHtml, bodyJson } = parsePayload(req);
  if (!articleId) {
    return res.status(400).json({ error: "Identifiant d’introduction manquant." });
  }

  try {
    const supabase = ensureClient();
    const { data: introRow, error: introErr } = await supabase
      .from("bicephale_articles")
      .select("id, title, author_name")
      .eq("id", articleId)
      .maybeSingle();

    if (introErr) {
      return res.status(400).json({ error: formatSupabaseError(introErr) });
    }

    const allowedTitles = new Set(INTRO_TITLES);
    if (!introRow || introRow.author_name !== "Intro" || !allowedTitles.has(introRow.title)) {
      return res.status(404).json({ error: "Introduction introuvable." });
    }

    let parsedBodyJson: Record<string, any> | null = null;
    if (bodyJson && bodyJson.trim()) {
      try {
        parsedBodyJson = JSON.parse(bodyJson);
      } catch (error) {
        return res.status(400).json({ error: "Le contenu JSON est invalide." });
      }
    }

    const { error: updateErr } = await supabase
      .from("bicephale_articles")
      .update({
        body_markdown: bodyMarkdown ?? "",
        body_html: bodyHtml && bodyHtml.trim() ? bodyHtml : null,
        body_json: parsedBodyJson,
      })
      .eq("id", articleId);

    if (updateErr) {
      return res.status(400).json({ error: formatSupabaseError(updateErr) });
    }

    const entries = await loadSupabaseIntroEntries(supabase);
    return res.status(200).json({ entries });
  } catch (error) {
    return res.status(500).json({ error: formatSupabaseError(error) });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<IntroResponse>) => {
  if (req.method === "GET") {
    return handleGet(res);
  }

  if (req.method === "PUT") {
    return handlePut(req, res);
  }

  res.setHeader("Allow", "GET,PUT");
  return res.status(405).end("Méthode non autorisée");
};

export default handler;
