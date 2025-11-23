import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerClient } from "../../../../lib/supabase/serverClient";
import {
  loadSupabaseCategorySummaries,
  loadSupabaseArticleDetail,
  formatSupabaseError,
} from "../../../../lib/supabase/content";
import type {
  SupabaseArticleCreatePayload,
  SupabaseArticleDetail,
  SupabaseCategorySummary,
} from "../../../../types/supabase";

export const config = { api: { bodyParser: { sizeLimit: "10mb" } } };

const ensureClient = () => {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error(
      "Supabase n’est pas configuré. Ajoutez SUPABASE_URL et SUPABASE_KEY."
    );
  }
  return client;
};

const parseBody = (req: NextApiRequest): SupabaseArticleCreatePayload => {
  const body = req.body ?? {};
  const getString = (key: string): string | null => {
    const value = body[key];
    if (value === undefined || value === null || value === "") {
      return null;
    }
    return String(value);
  };

  const getBoolean = (key: string, fallback = false): boolean => {
    const value = body[key];
    if (value === undefined || value === null) {
      return fallback;
    }
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value === "true" || value === "1" || value === "on";
    }
    return Boolean(value);
  };

  const toArray = (key: string): string[] => {
    const value = body[key];
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }
    if (typeof value === "string" && value.trim() !== "") {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };

  const authoredDate = getString("authoredDate");
  const publishedAt = getString("publishedAt");

  const payload: SupabaseArticleCreatePayload = {
    title: getString("title") ?? "",
    slug: getString("slug") ?? "",
    authorName: getString("authorName"),
    status: getBoolean("status", false),
    authoredDate: authoredDate,
    publishedAt: publishedAt,
    preview: getString("preview"),
    excerpt: getString("excerpt"),
    headerImagePath: getString("headerImagePath"),
    bodyMarkdown: getString("bodyMarkdown") ?? "",
    bodyJson: getString("bodyJson"),
    bodyHtml: getString("bodyHtml"),
    categoryIds: toArray("categoryIds"),
    relatedArticleIds: toArray("relatedArticleIds"),
  };

  return payload;
};

const upsertArticle = async (
  payload: SupabaseArticleCreatePayload
): Promise<SupabaseArticleDetail> => {
  if (!payload.slug.trim()) {
    throw new Error("Un slug est requis pour créer l’article.");
  }

  const supabase = ensureClient();

  let bodyJsonValue: Record<string, any> | null = null;
  if (payload.bodyJson && payload.bodyJson.trim()) {
    try {
      bodyJsonValue = JSON.parse(payload.bodyJson);
    } catch (error) {
      throw new Error("Le contenu JSON est invalide.");
    }
  }
  const bodyHtmlValue = payload.bodyHtml && payload.bodyHtml.trim() ? payload.bodyHtml : null;

  const { data: insertRows, error: insertErr } = await supabase
    .from("bicephale_articles")
    .insert({
      slug: payload.slug,
      title: payload.title,
      author_name: payload.authorName,
      status: payload.status,
      authored_date: payload.authoredDate,
      published_at: payload.publishedAt,
      preview: payload.preview,
      excerpt: payload.excerpt,
      header_image_path: payload.headerImagePath,
      body_markdown: payload.bodyMarkdown,
      body_json: bodyJsonValue,
      body_html: bodyHtmlValue,
    })
    .select("id")
    .single();

  if (insertErr) {
    throw insertErr;
  }

  const articleId = insertRows?.id;
  if (!articleId) {
    throw new Error("Création de l’article impossible : identifiant manquant.");
  }

  if (payload.categoryIds.length) {
    const { error: categoryErr } = await supabase
      .from("bicephale_article_categories")
      .insert(
        payload.categoryIds.map((categoryId, index) => ({
          article_id: articleId,
          category_id: categoryId,
          sort_order: index,
        }))
      );
    if (categoryErr) {
      throw categoryErr;
    }
  }

  if (payload.relatedArticleIds.length) {
    const filtered = payload.relatedArticleIds.filter((relatedId) => relatedId !== articleId);
    if (filtered.length) {
      const { error: relationErr } = await supabase
        .from("bicephale_article_relations")
        .insert(
          filtered.map((relatedId, index) => ({
            source_article_id: articleId,
            related_article_id: relatedId,
            sort_order: index,
          }))
        );
      if (relationErr) {
        throw relationErr;
      }
    }
  }

  const detail = await loadSupabaseArticleDetail(supabase, articleId);
  if (!detail) {
    throw new Error("Impossible de charger l’article nouvellement créé.");
  }
  return detail;
};

const handleGet = async (
  res: NextApiResponse<{ categories: SupabaseCategorySummary[] } | { error: string }>
) => {
  try {
    const supabase = ensureClient();
    const categories = await loadSupabaseCategorySummaries(supabase);
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: formatSupabaseError(error) });
  }
};

const handlePost = async (
  req: NextApiRequest,
  res: NextApiResponse<
    { article: SupabaseArticleDetail; categories: SupabaseCategorySummary[] } | { error: string }
  >
) => {
  try {
    const payload = parseBody(req);
    const article = await upsertArticle(payload);
    const supabase = ensureClient();
    const categories = await loadSupabaseCategorySummaries(supabase);
    return res.status(201).json({ article, categories });
  } catch (error) {
    return res.status(400).json({ error: formatSupabaseError(error) });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return handleGet(res);
  }

  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.setHeader("Allow", "GET,POST");
  return res.status(405).end("Méthode non autorisée");
};

export default handler;
