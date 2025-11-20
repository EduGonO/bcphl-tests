import type { PostgrestError } from "@supabase/supabase-js";
import type {
  SupabaseArticleDetail,
  SupabaseArticleSummary,
  SupabaseCategorySummary,
} from "../../types/supabase";
import type { ServerSupabaseClient } from "./serverClient";

const mapArticleSummary = (
  input: Record<string, any>,
  sortOrder: number
): SupabaseArticleSummary => ({
  id: String(input.id),
  slug: String(input.slug),
  title: String(input.title ?? ""),
  author: input.author_name ? String(input.author_name) : null,
  status: Boolean(input.status),
  authoredDate: input.authored_date ? String(input.authored_date) : null,
  publishedAt: input.published_at ? String(input.published_at) : null,
  updatedAt: input.updated_at ? String(input.updated_at) : null,
  preview: input.preview ?? null,
  excerpt: input.excerpt ?? null,
  headerImagePath: input.header_image_path ?? null,
  sortOrder,
});

const mapArticleDetailRow = (data: Record<string, any>): SupabaseArticleDetail => {
  const categories = Array.isArray(data.categories)
    ? data.categories
        .filter((entry: any) => Boolean(entry?.category))
        .map((entry: any) => ({
          id: String(entry.category.id),
          slug: String(entry.category.slug),
          name: String(entry.category.name),
          color: String(entry.category.color ?? "#607d8b"),
          sortOrder: (entry.category.sort_order as number | null) ?? 0,
          linkSortOrder: (entry.sort_order as number | null) ?? 0,
        }))
    : [];

  const relatedArticles = Array.isArray(data.relations)
    ? data.relations
        .filter((entry: any) => Boolean(entry?.related))
        .map((entry: any) => ({
          relatedId: String(entry.related.id),
          relatedSlug: String(entry.related.slug),
          title: String(entry.related.title ?? ""),
          status: Boolean(entry.related.status),
          sortOrder: (entry.sort_order as number | null) ?? 0,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const media = Array.isArray(data.media)
    ? data.media
        .map((entry: any) => ({
          id: String(entry.id),
          storageBucket: String(entry.storage_bucket ?? "article-media"),
          storagePath: String(entry.storage_path ?? ""),
          caption: entry.caption ?? null,
          credit: entry.credit ?? null,
          altText: entry.alt_text ?? null,
          isHeader: Boolean(entry.is_header),
          sortOrder: (entry.sort_order as number | null) ?? 0,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return {
    id: String(data.id),
    slug: String(data.slug),
    title: String(data.title ?? ""),
    authorName: data.author_name ? String(data.author_name) : null,
    status: Boolean(data.status),
    authoredDate: data.authored_date ? String(data.authored_date) : null,
    publishedAt: data.published_at ? String(data.published_at) : null,
    preview: data.preview ?? null,
    excerpt: data.excerpt ?? null,
    headerImagePath: data.header_image_path ?? null,
    bodyMarkdown: String(data.body_markdown ?? ""),
    bodyJson: data.body_json ? JSON.stringify(data.body_json, null, 2) : null,
    bodyHtml: data.body_html ?? null,
    categories: categories
      .slice()
      .sort((a, b) => {
        const orderDiff = a.linkSortOrder - b.linkSortOrder;
        if (orderDiff !== 0) return orderDiff;
        return a.sortOrder - b.sortOrder;
      })
      .map(({ linkSortOrder: _linkSortOrder, ...rest }) => rest),
    relatedArticles,
    media,
    createdAt: String(data.created_at),
    updatedAt: String(data.updated_at),
  };
};

export const loadSupabaseCategorySummaries = async (
  supabase: ServerSupabaseClient
): Promise<SupabaseCategorySummary[]> => {
  const { data: categoryRows, error: categoryErr } = await supabase
    .from("bicephale_categories")
    .select("id, slug, name, color, sort_order")
    .order("sort_order", { ascending: true });

  if (categoryErr) {
    throw categoryErr;
  }

  const map = new Map<string, SupabaseCategorySummary>();
  categoryRows?.forEach((row) => {
    map.set(row.id, {
      id: row.id,
      slug: row.slug,
      name: row.name,
      color: row.color,
      sortOrder: row.sort_order ?? 0,
      articles: [],
    });
  });

  const { data: linkRows, error: linkErr } = await supabase
    .from("bicephale_article_categories")
    .select(
      `category_id, sort_order, article:bicephale_articles!bicephale_article_categories_article_id_fkey (
        id,
        slug,
        title,
        author_name,
        status,
        authored_date,
        published_at,
        updated_at,
        preview,
        excerpt,
        header_image_path
      )`
    );

  if (linkErr) {
    throw linkErr;
  }

  linkRows?.forEach((link: any) => {
    const category = map.get(link.category_id as string);
    const rawArticle = Array.isArray(link.article) ? link.article[0] : link.article;
    if (!category || !rawArticle) return;

    category.articles.push(
      mapArticleSummary(rawArticle, (link.sort_order as number | null) ?? 0)
    );
  });

  return Array.from(map.values()).map((category) => ({
    ...category,
    articles: category.articles
      .slice()
      .sort((a, b) => {
        const orderDiff = a.sortOrder - b.sortOrder;
        if (orderDiff !== 0) return orderDiff;
        const aPublished = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const bPublished = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        if (aPublished !== bPublished) return bPublished - aPublished;
        return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      }),
  }));
};

export const loadSupabaseArticleDetail = async (
  supabase: ServerSupabaseClient,
  id: string
): Promise<SupabaseArticleDetail | null> => {
  const { data, error } = await supabase
    .from("bicephale_articles")
    .select(
      `id, slug, title, author_name, status, authored_date, published_at, preview, excerpt, header_image_path, body_markdown, body_json, body_html, created_at, updated_at,
       categories:bicephale_article_categories!bicephale_article_categories_article_id_fkey ( sort_order, category:bicephale_categories ( id, slug, name, color, sort_order ) ),
       relations:bicephale_article_relations!bicephale_article_relations_source_article_id_fkey ( sort_order, related:bicephale_articles!bicephale_article_relations_related_article_id_fkey ( id, slug, title, status ) ),
       media:bicephale_article_media ( id, storage_bucket, storage_path, caption, credit, alt_text, is_header, sort_order )`
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapArticleDetailRow(data);
};

type ArticleDetailLoadOptions = {
  includeBody?: boolean;
  includeRelations?: boolean;
  includeMedia?: boolean;
};

export const loadSupabaseArticleDetails = async (
  supabase: ServerSupabaseClient,
  ids: string[],
  options: ArticleDetailLoadOptions = {}
): Promise<Map<string, SupabaseArticleDetail>> => {
  if (!ids.length) {
    return new Map();
  }

  const { includeBody = true, includeRelations = true, includeMedia = true } = options;

  const baseFields = [
    "id",
    "slug",
    "title",
    "author_name",
    "status",
    "authored_date",
    "published_at",
    "preview",
    "excerpt",
    "header_image_path",
  ];

  if (includeBody) {
    baseFields.push("body_markdown", "body_json", "body_html");
  }

  baseFields.push("created_at", "updated_at");

  const selectEntries = [
    baseFields.join(", "),
    "categories:bicephale_article_categories!bicephale_article_categories_article_id_fkey ( sort_order, category:bicephale_categories ( id, slug, name, color, sort_order ) )",
  ];

  if (includeRelations) {
    selectEntries.push(
      "relations:bicephale_article_relations!bicephale_article_relations_source_article_id_fkey ( sort_order, related:bicephale_articles!bicephale_article_relations_related_article_id_fkey ( id, slug, title, status ) )"
    );
  }

  if (includeMedia) {
    selectEntries.push(
      "media:bicephale_article_media ( id, storage_bucket, storage_path, caption, credit, alt_text, is_header, sort_order )"
    );
  }

  const { data, error } = await supabase
    .from("bicephale_articles")
    .select(selectEntries.join(",\n       "))
    .in("id", ids);

  if (error) {
    throw error;
  }

  const map = new Map<string, SupabaseArticleDetail>();
  data?.forEach((row) => {
    const detail = mapArticleDetailRow(row);
    if (!includeBody) {
      detail.bodyMarkdown = "";
      detail.bodyJson = null;
      detail.bodyHtml = null;
    }
    if (!includeRelations) {
      detail.relatedArticles = [];
    }
    if (!includeMedia) {
      detail.media = [];
    }
    map.set(detail.id, detail);
  });

  return map;
};

export const formatSupabaseError = (error: PostgrestError | Error | unknown): string => {
  if (!error) {
    return "Erreur inconnue";
  }
  if ((error as PostgrestError).message) {
    const err = error as PostgrestError;
    return err.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Erreur inconnue";
};
