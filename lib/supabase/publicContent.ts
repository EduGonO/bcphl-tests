import {
  formatSupabaseError,
  loadSupabaseArticleDetail,
  loadSupabaseCategorySummaries,
} from "./content";
import { getSupabaseServerClient, getSupabaseUrl } from "./serverClient";
import type {
  SupabaseArticleDetail,
  SupabaseArticleSummary,
  SupabaseCategorySummary,
} from "../../types/supabase";
import type { Article, Category } from "../../types";
import { mdToHtml } from "../markdown";

export type PublicCategory = Category & {
  articles: Article[];
};

export type PublicArticleDetail = {
  article: Article;
  contentHtml: string;
  categories: Category[];
  relatedArticles: Article[];
  media: Array<{
    id: string;
    url: string;
    caption: string | null;
    credit: string | null;
    altText: string | null;
    isHeader: boolean;
  }>;
  raw: SupabaseArticleDetail;
};

export type PublicContentResult = {
  categories: PublicCategory[];
  articles: Article[];
};

const defaultColor = "#607d8b";

const getSupabasePublicBaseUrl = (): string | null => {
  const url = getSupabaseUrl();
  return url ? url.replace(/\/$/, "") : null;
};

const getStorageBucketBaseUrl = (bucket: string | null): string | null => {
  const targetBucket = bucket && bucket.trim().length ? bucket : "article-media";
  const baseUrl = getSupabasePublicBaseUrl();
  if (!baseUrl) {
    return null;
  }
  return `${baseUrl}/storage/v1/object/public/${targetBucket}`;
};

const buildStoragePublicUrl = (
  bucket: string | null,
  storagePath: string | null
): string | null => {
  if (!storagePath) {
    return null;
  }

  if (/^https?:\/\//i.test(storagePath)) {
    return storagePath;
  }

  const base = getStorageBucketBaseUrl(bucket);
  if (!base) {
    return storagePath;
  }

  const normalizedPath = storagePath.replace(/^\/+/, "");
  return `${base}/${normalizedPath}`;
};

const mapSummaryToArticle = (
  summary: SupabaseArticleSummary,
  category: SupabaseCategorySummary
): Article => {
  const publishedAt = summary.publishedAt ?? null;
  const authoredDate = summary.authoredDate ?? null;
  const updatedAt = summary.updatedAt ?? null;
  const headerImage =
    buildStoragePublicUrl("article-media", summary.headerImagePath) ??
    summary.headerImagePath ??
    "";
  const preview = summary.preview ?? summary.excerpt ?? "";
  const author = summary.author ?? "";

  return {
    id: summary.id,
    slug: summary.slug,
    category: category.slug,
    categoryName: category.name,
    title: summary.title,
    date: publishedAt || authoredDate || updatedAt || "",
    author,
    preview,
    media: headerImage ? [headerImage] : [],
    headerImage,
    excerpt: summary.excerpt ?? null,
    publishedAt,
    authoredDate,
    updatedAt,
  };
};

const normalizeCategory = (
  category: SupabaseCategorySummary
): PublicCategory => {
  const color = category.color && category.color.trim().length
    ? category.color
    : defaultColor;

  const articles = category.articles
    .filter((article) => article.status)
    .map((article) => mapSummaryToArticle(article, category));

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    color,
    articles,
  };
};

const ensureArticleCategories = (
  detail: SupabaseArticleDetail
): Category[] => {
  if (!Array.isArray(detail.categories)) {
    return [];
  }

  return detail.categories.map((entry) => ({
    id: entry.id,
    slug: entry.slug,
    name: entry.name,
    color: entry.color ?? defaultColor,
  }));
};

const mapDetailToArticle = (
  detail: SupabaseArticleDetail,
  primaryCategory?: Category
): Article => {
  const headerMediaEntry = detail.media.find((media) => media.isHeader) ?? null;
  const headerImage =
    buildStoragePublicUrl(headerMediaEntry?.storageBucket ?? null, headerMediaEntry?.storagePath ?? null) ??
    buildStoragePublicUrl("article-media", detail.headerImagePath) ??
    detail.headerImagePath ??
    "";

  const publishedAt = detail.publishedAt ?? null;
  const authoredDate = detail.authoredDate ?? null;
  const updatedAt = detail.updatedAt ?? null;
  const category = primaryCategory ?? ensureArticleCategories(detail)[0] ?? null;
  const categorySlug = category?.slug ?? "";
  const categoryName = category?.name ?? "";

  return {
    id: detail.id,
    slug: detail.slug,
    category: categorySlug,
    categoryName,
    title: detail.title,
    date: publishedAt || authoredDate || updatedAt || "",
    author: detail.authorName ?? "",
    preview: detail.preview ?? detail.excerpt ?? "",
    media: detail.media
      .map((entry) => buildStoragePublicUrl(entry.storageBucket, entry.storagePath))
      .filter((value): value is string => Boolean(value)),
    headerImage,
    excerpt: detail.excerpt ?? null,
    publishedAt,
    authoredDate,
    updatedAt,
  };
};

const mapRelatedArticle = (
  related: SupabaseArticleDetail["relatedArticles"][number]
): Article => ({
  id: related.relatedId,
  slug: related.relatedSlug,
  category: "",
  categoryName: "",
  title: related.title,
  date: "",
  author: "",
  preview: "",
  media: [],
  headerImage: "",
  excerpt: null,
  publishedAt: null,
  authoredDate: null,
  updatedAt: null,
});

export const loadPublicContent = async (): Promise<PublicContentResult> => {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error(
      "Configurer les variables d'environnement nécessaires pour activer la synchronisation des articles."
    );
  }

  const summaries = await loadSupabaseCategorySummaries(supabase);
  const categories = summaries.map(normalizeCategory);

  const articleMap = new Map<string, Article>();
  categories.forEach((category) => {
    category.articles.forEach((article) => {
      if (!articleMap.has(article.id)) {
        articleMap.set(article.id, article);
      }
    });
  });

  return {
    categories,
    articles: Array.from(articleMap.values()),
  };
};

export const loadPublicArticleBySlug = async (
  slug: string
): Promise<PublicArticleDetail | null> => {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    throw new Error(
      "Configurer les variables d'environnement nécessaires pour activer la synchronisation des articles."
    );
  }

  const { data: articleRow, error } = await supabase
    .from("bicephale_articles")
    .select("id")
    .eq("slug", slug)
    .eq("status", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!articleRow) {
    return null;
  }

  const detail = await loadSupabaseArticleDetail(supabase, String(articleRow.id));
  if (!detail) {
    return null;
  }

  if (!detail.status) {
    return null;
  }

  const categories = ensureArticleCategories(detail);
  const primaryCategory = categories[0];

  const article = mapDetailToArticle(detail, primaryCategory);

  const media = detail.media.map((entry) => ({
    id: entry.id,
    url:
      buildStoragePublicUrl(entry.storageBucket, entry.storagePath) ??
      entry.storagePath ??
      "",
    caption: entry.caption ?? null,
    credit: entry.credit ?? null,
    altText: entry.altText ?? null,
    isHeader: entry.isHeader,
  }));

  const relatedArticles = detail.relatedArticles
    .filter((related) => related.status)
    .map(mapRelatedArticle);

  const markdownBase = (() => {
    if (!detail.media.length) {
      return getStorageBucketBaseUrl("article-media");
    }
    const firstMedia = detail.media[0];
    const bucketBase = getStorageBucketBaseUrl(firstMedia.storageBucket);
    if (!bucketBase) {
      return null;
    }
    const normalizedPath = firstMedia.storagePath
      ? firstMedia.storagePath.replace(/\/[^/]*$/, "")
      : "";
    return normalizedPath ? `${bucketBase}/${normalizedPath}` : bucketBase;
  })();

  const contentHtml = detail.bodyHtml
    ? String(detail.bodyHtml)
    : detail.bodyMarkdown
    ? mdToHtml(detail.bodyMarkdown, markdownBase ?? "")
    : "";

  return {
    article,
    contentHtml,
    categories,
    relatedArticles,
    media,
    raw: detail,
  };
};

export const safeLoadPublicContent = async () => {
  try {
    return await loadPublicContent();
  } catch (error) {
    return {
      categories: [],
      articles: [],
      error: formatSupabaseError(error),
    };
  }
};

