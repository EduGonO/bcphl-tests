import type { SupabaseArticleDetail, SupabaseArticleRelation, SupabaseCategorySummary } from "../types/supabase";
import { Article, Category } from "../types";
import {
  categoryConfigMap,
  categoryToSlug,
  defaultCategoryColor,
} from "../config/categoryColors";
import { getSupabaseServerClient } from "./supabase/serverClient";
import {
  loadSupabaseArticleDetail,
  loadSupabaseCategorySummaries,
} from "./supabase/content";

const SOURCE_TYPE = "supabase" as const;

type ArticleSource = typeof SOURCE_TYPE;

export type ArticleRecord = {
  article: Article;
  body: string;
  bodyHtml: string | null;
  supabaseId: string;
  articleCategories: Category[];
  relatedArticles: SupabaseArticleRelation[];
  publicBasePath: string;
  sourceType: ArticleSource;
};

type ArticleCollection = {
  records: ArticleRecord[];
  categories: Category[];
};

type DetailCache = Map<string, Promise<SupabaseArticleDetail | null>>;

const configSlugMap = new Map<string, string>();
Object.keys(categoryConfigMap).forEach((name) => {
  const slug = categoryToSlug(name);
  configSlugMap.set(slug.toLowerCase(), name);
  configSlugMap.set(name.toLowerCase(), name);
});

const ensureSupabaseClient = () => {
  const client = getSupabaseServerClient();
  if (!client) {
    throw new Error(
      "Supabase n’est pas configuré. Ajoutez SUPABASE_URL et SUPABASE_KEY."
    );
  }
  return client;
};

const fetchArticleDetail = async (
  articleId: string,
  supabase = ensureSupabaseClient(),
  cache?: DetailCache
): Promise<SupabaseArticleDetail | null> => {
  const targetCache = cache ?? new Map<string, Promise<SupabaseArticleDetail | null>>();

  let detailPromise = targetCache.get(articleId);
  if (!detailPromise) {
    detailPromise = loadSupabaseArticleDetail(supabase, articleId);
    targetCache.set(articleId, detailPromise);
  }

  return detailPromise.then((detail) => detail ?? null);
};

const buildStoragePublicUrl = (bucket: string, rawPath?: string | null): string => {
  if (!rawPath) {
    return "";
  }

  const path = String(rawPath).trim();
  if (!path) {
    return "";
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.includes("/storage/v1/object/public/")) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!baseUrl) {
    return `/${path}`;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${bucket}/`), "");

  return `${normalizedBase}/storage/v1/object/public/${bucket}/${normalizedPath}`;
};

const createPreview = (body: string): string => {
  const cleaned = body
    .replace(/^#{1,6}\s.*?\n+/, "")
    .replace(/^\s*!\[[^\]]*]\([^)]+\)\s*$/gm, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();

  if (!cleaned) {
    return "";
  }

  const min = 180;
  const max = 260;
  const slice = cleaned.slice(min, max);
  const relEnd = slice.search(/[.!?](?:\s|\n)/);
  const cut = relEnd !== -1 ? min + relEnd + 1 : Math.min(cleaned.length, 200);
  let preview = cleaned.slice(0, cut).trim();
  if (relEnd === -1 && cut < cleaned.length) {
    preview += "…";
  }
  return preview;
};

const resolvePreview = (
  summary: { preview: string | null; excerpt: string | null },
  detail: SupabaseArticleDetail
): string => {
  return (
    summary.preview?.trim() ||
    summary.excerpt?.trim() ||
    detail.preview?.trim() ||
    detail.excerpt?.trim() ||
    createPreview(detail.bodyMarkdown ?? "")
  );
};

const resolveDate = (
  summary: { publishedAt: string | null; authoredDate: string | null; updatedAt: string | null },
  detail: SupabaseArticleDetail
): string => {
  return (
    summary.publishedAt?.trim() ||
    detail.publishedAt?.trim() ||
    summary.authoredDate?.trim() ||
    detail.authoredDate?.trim() ||
    summary.updatedAt?.trim() ||
    detail.updatedAt?.trim() ||
    detail.createdAt?.trim() ||
    "Unknown Date"
  );
};

const resolveCategoryMeta = (
  category: SupabaseCategorySummary
): Category => {
  const candidateSlug = (category.slug || categoryToSlug(category.name)).trim();
  const configName =
    configSlugMap.get(candidateSlug.toLowerCase()) ||
    configSlugMap.get(category.name.toLowerCase()) ||
    category.name ||
    category.slug ||
    category.id;

  const configEntry = categoryConfigMap[configName];
  const slugMatch = configSlugMap.get(candidateSlug.toLowerCase());
  const slug =
    slugMatch ||
    category.slug?.trim() ||
    categoryToSlug(configName) ||
    configName;
  const color = category.color?.trim() || configEntry?.color || defaultCategoryColor;

  return {
    id: category.id,
    slug,
    name: configName,
    color,
  };
};

const resolveMedia = (detail: SupabaseArticleDetail): string[] => {
  const urls = detail.media
    .map((entry) => buildStoragePublicUrl(entry.storageBucket, entry.storagePath))
    .filter((value): value is string => Boolean(value));
  return Array.from(new Set(urls));
};

const resolveHeaderImage = (
  summary: { headerImagePath: string | null },
  detail: SupabaseArticleDetail,
  media: string[]
): string => {
  const headerMedia = detail.media.find((entry) => entry.isHeader);
  const headerFromMedia = headerMedia
    ? buildStoragePublicUrl(headerMedia.storageBucket, headerMedia.storagePath)
    : "";

  const headerFromSummary = buildStoragePublicUrl(
    headerMedia?.storageBucket || "article-media",
    summary.headerImagePath || detail.headerImagePath || null
  );

  const header = headerFromMedia || headerFromSummary || media[0] || "";
  if (header && !media.includes(header)) {
    media.unshift(header);
  }
  return header;
};

const mapArticleCategories = (
  detail: SupabaseArticleDetail,
  categoriesById: Map<string, Category>,
  categoriesBySlug: Map<string, Category>
): Category[] => {
  const mapped: Category[] = [];

  detail.categories.forEach((entry) => {
    const byId = categoriesById.get(entry.id);
    const slugKey = entry.slug ? entry.slug.toLowerCase() : categoryToSlug(entry.name).toLowerCase();
    const bySlug = categoriesBySlug.get(slugKey);
    const fallbackColor = entry.color?.trim() || defaultCategoryColor;

    if (byId) {
      mapped.push(byId);
    } else if (bySlug) {
      mapped.push(bySlug);
    } else {
      mapped.push({
        id: entry.id,
        slug: entry.slug || entry.name,
        name: entry.name,
        color: fallbackColor,
      });
    }
  });

  return mapped;
};

const ensureCollection = async (): Promise<ArticleCollection> => {
  const supabase = ensureSupabaseClient();
  const supabaseCategories = await loadSupabaseCategorySummaries(supabase);

  const categories = supabaseCategories.map(resolveCategoryMeta);
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const categoriesBySlug = new Map(
    categories.map((category) => [category.slug.toLowerCase(), category])
  );

  const records: ArticleRecord[] = [];
  const seenKeys = new Set<string>();
  const detailCache: DetailCache = new Map();

  for (const categorySummary of supabaseCategories) {
    const categoryMeta =
      categoriesById.get(categorySummary.id) ||
      categoriesBySlug.get((categorySummary.slug || "").toLowerCase());

    const categorySlug = categoryMeta?.slug || categorySummary.slug || categoryToSlug(categorySummary.name);
    const categoryName = categoryMeta?.name || categorySummary.name || categorySlug;

    for (const summary of categorySummary.articles) {
      if (!summary.status) {
        continue;
      }

      const detail = await fetchArticleDetail(summary.id, supabase, detailCache);
      if (!detail || !detail.status) {
        continue;
      }

      const recordKey = `${detail.id}::${categorySlug.toLowerCase()}`;
      if (seenKeys.has(recordKey)) {
        continue;
      }
      seenKeys.add(recordKey);

      const media = resolveMedia(detail);
      const headerImage = resolveHeaderImage(summary, detail, media);
      const articleCategories = mapArticleCategories(
        detail,
        categoriesById,
        categoriesBySlug
      );

      const article: Article = {
        id: detail.id,
        title: detail.title,
        slug: detail.slug,
        category: categoryName,
        categorySlug,
        date: resolveDate(summary, detail),
        author: detail.authorName ?? "",
        preview: resolvePreview(summary, detail),
        media,
        headerImage,
      };

      const record: ArticleRecord = {
        article,
        body: detail.bodyMarkdown ?? "",
        bodyHtml: detail.bodyHtml,
        supabaseId: detail.id,
        articleCategories,
        relatedArticles: detail.relatedArticles,
        publicBasePath: "",
        sourceType: SOURCE_TYPE,
      };

      records.push(record);
    }
  }

  return { records, categories };
};

export const getArticleRecords = async (): Promise<ArticleRecord[]> => {
  const collection = await ensureCollection();
  return collection.records;
};

export const findArticleRecord = async (
  category: string,
  slug: string
): Promise<ArticleRecord | undefined> => {
  const normalizedCategory = category.toLowerCase();
  const normalizedSlug = slug.toLowerCase();
  const records = await getArticleRecords();

  return records.find((record) => {
    const categorySlug = record.article.categorySlug.toLowerCase();
    const categoryName = record.article.category.toLowerCase();
    const slugMatches = record.article.slug.toLowerCase() === normalizedSlug;
    const categoryMatches =
      categorySlug === normalizedCategory || categoryName === normalizedCategory;
    return slugMatches && categoryMatches;
  });
};

export async function getArticleData(): Promise<{
  articles: Article[];
  categories: Category[];
}> {
  const { records, categories } = await ensureCollection();
  return { articles: records.map((record) => record.article), categories };
}

export const clearArticleCache = () => {
  // Intentionally left blank; the Supabase-backed loader fetches fresh data per request.
};
