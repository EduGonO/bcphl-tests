import type {
  SupabaseArticleDetail,
  SupabaseArticleRelation,
  SupabaseCategorySummary,
} from "../types/supabase";
import { Article, Category } from "../types";
import {
  categoryConfigMap,
  categoryToSlug,
  defaultCategoryColor,
} from "../config/categoryColors";
import { getSupabaseServerClient } from "./supabase/serverClient";
import {
  loadSupabaseArticleDetails,
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

type ArticleCollectionResult = {
  collection: ArticleCollection;
  version: number;
};

type ArticleSummaryWithCategory = {
  summary: SupabaseCategorySummary["articles"][number];
  categorySlug: string;
  categoryName: string;
};

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

const CACHE_TTL_MS = (() => {
  const parsed = Number(process.env.ARTICLE_CACHE_TTL_MS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return 5 * 60 * 1000; // 5 minutes by default
})();

const VERSION_CHECK_INTERVAL_MS = (() => {
  const parsed = Number(process.env.ARTICLE_CACHE_VERSION_CHECK_MS);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0; // default to checking freshness on every request
})();

let cachedCollectionPromise: Promise<ArticleCollectionResult> | null = null;
let cacheExpiresAt = 0;
let cachedCollectionVersion = 0;
let lastVersionCheckAt = 0;
const hydratedDetailCache = new Map<string, ArticleRecord>();

const parseTimestamp = (input: string | null | undefined): number => {
  const timestamp = Date.parse(input ?? "");
  return Number.isFinite(timestamp) ? timestamp : 0;
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
    try {
      const url = new URL(path);
      const host = url.hostname.toLowerCase();

      if (
        host === "drive.google.com" ||
        host === "drive.usercontent.google.com" ||
        host === "lh3.googleusercontent.com"
      ) {
        const fileIdFromPath = url.pathname.match(/\/d\/([^/]+)/)?.[1];
        const fileId = fileIdFromPath || url.searchParams.get("id");

        if (fileId) {
          const normalizedId = fileId.trim();
          if (normalizedId) {
            const hasPdfHint =
              /\.pdf($|\?)/i.test(url.pathname) ||
              /\.pdf($|\?)/i.test(url.search) ||
              /\.pdf($|\?)/i.test(url.hash);

            if (host === "drive.google.com" || hasPdfHint) {
              return `https://drive.google.com/thumbnail?authuser=0&id=${normalizedId}&sz=w2000`;
            }

            return `https://drive.usercontent.google.com/uc?id=${normalizedId}&export=view`;
          }
        }
      }
    } catch {
      // fall back to returning the original path below
    }

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

const buildArticleSummaries = (
  supabaseCategories: SupabaseCategorySummary[],
  categoriesById: Map<string, Category>,
  categoriesBySlug: Map<string, Category>
): ArticleSummaryWithCategory[] => {
  const summaries: ArticleSummaryWithCategory[] = [];

  supabaseCategories.forEach((categorySummary) => {
    const categoryMeta =
      categoriesById.get(categorySummary.id) ||
      categoriesBySlug.get((categorySummary.slug || "").toLowerCase());

    const categorySlug =
      categoryMeta?.slug ||
      categorySummary.slug ||
      categoryToSlug(categorySummary.name);
    const categoryName = categoryMeta?.name || categorySummary.name || categorySlug;

    categorySummary.articles.forEach((summary) => {
      if (!summary.status) {
        return;
      }

      summaries.push({ summary, categorySlug, categoryName });
    });
  });

  return summaries;
};

const loadLatestContentVersion = async (
  supabase = ensureSupabaseClient()
): Promise<number> => {
  const [articleResult, linkResult] = await Promise.all([
    supabase
      .from("bicephale_articles")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bicephale_article_categories")
      .select("updated_at")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const articleTimestamp = articleResult.data?.updated_at
    ? parseTimestamp(String(articleResult.data.updated_at))
    : 0;
  const linkTimestamp = linkResult.data?.updated_at
    ? parseTimestamp(String(linkResult.data.updated_at))
    : 0;

  return Math.max(articleTimestamp, linkTimestamp, 0);
};

const computeCollectionVersion = (
  summaries: ArticleSummaryWithCategory[],
  detailsById: Map<string, SupabaseArticleDetail>
): number => {
  let version = 0;

  summaries.forEach(({ summary }) => {
    version = Math.max(
      version,
      parseTimestamp(summary.updatedAt),
      parseTimestamp(summary.publishedAt)
    );
  });

  detailsById.forEach((detail) => {
    version = Math.max(
      version,
      parseTimestamp(detail.updatedAt),
      parseTimestamp(detail.createdAt),
      parseTimestamp(detail.publishedAt)
    );
  });

  return version || Date.now();
};

const loadCollection = async (
  supabase = ensureSupabaseClient()
): Promise<ArticleCollectionResult> => {
  const supabaseCategories = await loadSupabaseCategorySummaries(supabase);

  const categories = supabaseCategories.map(resolveCategoryMeta);
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const categoriesBySlug = new Map(
    categories.map((category) => [category.slug.toLowerCase(), category])
  );

  const summaries = buildArticleSummaries(
    supabaseCategories,
    categoriesById,
    categoriesBySlug
  );

  const articleIds = Array.from(new Set(summaries.map(({ summary }) => summary.id)));

  const batchedDetails = await loadSupabaseArticleDetails(supabase, articleIds, {
    includeBody: false,
    includeRelations: false,
  });

  const detailsById = new Map<string, SupabaseArticleDetail>();
  articleIds.forEach((id) => {
    const detail = batchedDetails.get(id);
    if (detail && detail.status) {
      detailsById.set(id, detail);
    }
  });

  const records: ArticleRecord[] = [];
  const seenKeys = new Set<string>();

  summaries.forEach(({ summary, categoryName, categorySlug }) => {
    const detail = detailsById.get(summary.id);
    if (!detail) {
      return;
    }

    const recordKey = `${detail.id}::${categorySlug.toLowerCase()}`;
    if (seenKeys.has(recordKey)) {
      return;
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
  });

  const collection = { records, categories };
  const version = computeCollectionVersion(summaries, detailsById);

  return { collection, version };
};

const getCachedCollection = async (): Promise<ArticleCollection> => {
  const now = Date.now();
  const supabase = ensureSupabaseClient();
  const hasValidCache = cachedCollectionPromise && now < cacheExpiresAt;

  if (hasValidCache && now - lastVersionCheckAt < VERSION_CHECK_INTERVAL_MS) {
    const { collection } = await cachedCollectionPromise!;
    return collection;
  }

  if (hasValidCache) {
    try {
      const latestVersion = await loadLatestContentVersion(supabase);
      lastVersionCheckAt = now;
      if (latestVersion <= cachedCollectionVersion) {
        const { collection } = await cachedCollectionPromise!;
        return collection;
      }
    } catch (err) {
      // If freshness check fails, fall back to cached data to avoid user-facing errors.
      const { collection } = await cachedCollectionPromise!;
      return collection;
    }
  }

  const pendingCollection = loadCollection(supabase);
  cachedCollectionPromise = pendingCollection;
  cacheExpiresAt = now + CACHE_TTL_MS;

  pendingCollection.catch(() => {
    if (cachedCollectionPromise === pendingCollection) {
      cachedCollectionPromise = null;
      cacheExpiresAt = 0;
      cachedCollectionVersion = 0;
    }
  });

  const { collection, version } = await pendingCollection;
  cachedCollectionVersion = version;
  hydratedDetailCache.clear();

  return collection;
};

export const getArticleRecords = async (): Promise<ArticleRecord[]> => {
  const collection = await getCachedCollection();
  return collection.records;
};

export const findArticleRecord = async (
  category: string,
  slug: string
): Promise<ArticleRecord | undefined> => {
  const normalizedCategory = category.toLowerCase();
  const normalizedSlug = slug.toLowerCase();
  const records = await getArticleRecords();

  const baseRecord = records.find((record) => {
    const categorySlug = record.article.categorySlug.toLowerCase();
    const categoryName = record.article.category.toLowerCase();
    const slugMatches = record.article.slug.toLowerCase() === normalizedSlug;
    const categoryMatches =
      categorySlug === normalizedCategory || categoryName === normalizedCategory;
    return slugMatches && categoryMatches;
  });

  if (!baseRecord) {
    return undefined;
  }

  const cacheKey = `${cachedCollectionVersion}:${baseRecord.supabaseId}`;
  const cachedDetail = hydratedDetailCache.get(cacheKey);
  if (cachedDetail) {
    return cachedDetail;
  }

  const supabase = ensureSupabaseClient();
  const detailMap = await loadSupabaseArticleDetails(supabase, [
    baseRecord.supabaseId,
  ]);
  const detail = detailMap.get(baseRecord.supabaseId);
  if (!detail || !detail.status) {
    return baseRecord;
  }

  const media = resolveMedia(detail);
  const headerImage = resolveHeaderImage(
    {
      headerImagePath: detail.headerImagePath,
    },
    detail,
    media
  );

  const hydratedRecord: ArticleRecord = {
    ...baseRecord,
    article: {
      ...baseRecord.article,
      date: resolveDate(
        {
          publishedAt: detail.publishedAt,
          authoredDate: detail.authoredDate,
          updatedAt: detail.updatedAt,
        },
        detail
      ),
      preview: resolvePreview(
        {
          preview: baseRecord.article.preview,
          excerpt: detail.excerpt,
        },
        detail
      ),
      media,
      headerImage,
    },
    body: detail.bodyMarkdown ?? "",
    bodyHtml: detail.bodyHtml,
    relatedArticles: detail.relatedArticles,
  };

  hydratedDetailCache.set(cacheKey, hydratedRecord);
  return hydratedRecord;
};

export async function getArticleData(): Promise<{
  articles: Article[];
  categories: Category[];
}> {
  const { records, categories } = await getCachedCollection();
  return { articles: records.map((record) => record.article), categories };
}

export const clearArticleCache = () => {
  cachedCollectionPromise = null;
  cacheExpiresAt = 0;
  cachedCollectionVersion = 0;
  lastVersionCheckAt = 0;
  hydratedDetailCache.clear();
};
