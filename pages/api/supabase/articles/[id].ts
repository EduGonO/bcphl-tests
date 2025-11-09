import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabaseServerClient } from "../../../../lib/supabase/serverClient";
import {
  loadSupabaseArticleDetail,
  loadSupabaseCategorySummaries,
  formatSupabaseError,
} from "../../../../lib/supabase/content";
import type {
  SupabaseArticleDetail,
  SupabaseArticleUpsertPayload,
  SupabaseCategorySummary,
} from "../../../../types/supabase";

const ensureClient = () => {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error(
      "Supabase n’est pas configuré. Ajoutez SUPABASE_URL et SUPABASE_KEY."
    );
  }
  return client;
};

const parsePayload = (req: NextApiRequest): SupabaseArticleUpsertPayload => {
  const body = req.body ?? {};

  const normalizeString = (key: string): string | null => {
    const value = body[key];
    if (value === undefined || value === null || value === "") {
      return null;
    }
    return String(value);
  };

  const toBoolean = (key: string, fallback = false): boolean => {
    const value = body[key];
    if (value === undefined || value === null) return fallback;
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

  return {
    title: normalizeString("title") ?? "",
    slug: normalizeString("slug") ?? "",
    authorName: normalizeString("authorName"),
    status: toBoolean("status", false),
    authoredDate: normalizeString("authoredDate"),
    publishedAt: normalizeString("publishedAt"),
    preview: normalizeString("preview"),
    excerpt: normalizeString("excerpt"),
    headerImagePath: normalizeString("headerImagePath"),
    bodyMarkdown: normalizeString("bodyMarkdown") ?? "",
    bodyJson: normalizeString("bodyJson"),
    bodyHtml: normalizeString("bodyHtml"),
    categoryIds: toArray("categoryIds"),
    relatedArticleIds: toArray("relatedArticleIds"),
  };
};

const handleGet = async (
  articleId: string,
  res: NextApiResponse<{ article: SupabaseArticleDetail } | { error: string }>
) => {
  try {
    const supabase = ensureClient();
    const article = await loadSupabaseArticleDetail(supabase, articleId);
    if (!article) {
      return res.status(404).json({ error: "Article introuvable" });
    }
    return res.status(200).json({ article });
  } catch (error) {
    return res.status(500).json({ error: formatSupabaseError(error) });
  }
};

const handlePut = async (
  articleId: string,
  req: NextApiRequest,
  res: NextApiResponse<{ article: SupabaseArticleDetail; categories: SupabaseCategorySummary[] } | { error: string }>
) => {
  try {
    const supabase = ensureClient();
    const payload = parsePayload(req);

    if (!payload.slug.trim()) {
      return res.status(400).json({ error: "Le slug est obligatoire." });
    }

    let bodyJsonValue: Record<string, any> | null = null;
    if (payload.bodyJson && payload.bodyJson.trim()) {
      try {
        bodyJsonValue = JSON.parse(payload.bodyJson);
      } catch (parseError) {
        return res.status(400).json({ error: "Le contenu JSON est invalide." });
      }
    }

    const { error: updateErr } = await supabase
      .from("bicephale_articles")
      .update({
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
        body_html: payload.bodyHtml && payload.bodyHtml.trim() ? payload.bodyHtml : null,
      })
      .eq("id", articleId);

    if (updateErr) {
      return res.status(400).json({ error: formatSupabaseError(updateErr) });
    }

    const { error: deleteCategoriesErr } = await supabase
      .from("bicephale_article_categories")
      .delete()
      .eq("article_id", articleId);

    if (deleteCategoriesErr) {
      return res.status(400).json({ error: formatSupabaseError(deleteCategoriesErr) });
    }

    if (payload.categoryIds.length) {
      const { error: insertCategoriesErr } = await supabase
        .from("bicephale_article_categories")
        .insert(
          payload.categoryIds.map((categoryId, index) => ({
            article_id: articleId,
            category_id: categoryId,
            sort_order: index,
          }))
        );
      if (insertCategoriesErr) {
        return res.status(400).json({ error: formatSupabaseError(insertCategoriesErr) });
      }
    }

    const { error: deleteRelationsErr } = await supabase
      .from("bicephale_article_relations")
      .delete()
      .eq("source_article_id", articleId);

    if (deleteRelationsErr) {
      return res.status(400).json({ error: formatSupabaseError(deleteRelationsErr) });
    }

    const filteredRelated = payload.relatedArticleIds.filter((relatedId) => relatedId !== articleId);
    if (filteredRelated.length) {
      const { error: insertRelationsErr } = await supabase
        .from("bicephale_article_relations")
        .insert(
          filteredRelated.map((relatedId, index) => ({
            source_article_id: articleId,
            related_article_id: relatedId,
            sort_order: index,
          }))
        );
      if (insertRelationsErr) {
        return res.status(400).json({ error: formatSupabaseError(insertRelationsErr) });
      }
    }

    const article = await loadSupabaseArticleDetail(supabase, articleId);
    if (!article) {
      return res.status(404).json({ error: "Article introuvable après mise à jour." });
    }

    const categories = await loadSupabaseCategorySummaries(supabase);
    return res.status(200).json({ article, categories });
  } catch (error) {
    return res.status(400).json({ error: formatSupabaseError(error) });
  }
};

const handleDelete = async (
  articleId: string,
  res: NextApiResponse<{ success: true } | { error: string }>
) => {
  try {
    const supabase = ensureClient();
    const { error } = await supabase
      .from("bicephale_articles")
      .delete()
      .eq("id", articleId);

    if (error) {
      return res.status(400).json({ error: formatSupabaseError(error) });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: formatSupabaseError(error) });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const articleId = String(req.query.id);

  if (req.method === "GET") {
    return handleGet(articleId, res);
  }

  if (req.method === "PUT") {
    return handlePut(articleId, req, res);
  }

  if (req.method === "DELETE") {
    return handleDelete(articleId, res);
  }

  res.setHeader("Allow", "GET,PUT,DELETE");
  return res.status(405).end("Méthode non autorisée");
};

export default handler;
