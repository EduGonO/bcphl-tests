import type {
  SupabaseArticleDetail,
  SupabaseArticleSummary,
  SupabaseBioEntry,
  SupabaseCategorySummary,
} from "../../../../types/supabase";
import type { BioFormState, SupabaseFormState } from "./supabaseWorkspaceTypes";

export const decodeUnicodeEscapes = (value: string | null | undefined): string => {
  if (!value) return "";
  return value.replace(/\\[uU]([0-9a-fA-F]{4})/g, (_, hex: string) =>
    String.fromCharCode(parseInt(hex, 16))
  );
};

const decodeArticleSummary = (article: SupabaseArticleSummary): SupabaseArticleSummary => ({
  ...article,
  slug: decodeUnicodeEscapes(article.slug),
  title: decodeUnicodeEscapes(article.title),
  author: article.author ? decodeUnicodeEscapes(article.author) : null,
  preview: article.preview ? decodeUnicodeEscapes(article.preview) : null,
  excerpt: article.excerpt ? decodeUnicodeEscapes(article.excerpt) : null,
  headerImagePath: article.headerImagePath
    ? decodeUnicodeEscapes(article.headerImagePath)
    : null,
  bodyMarkdown: article.bodyMarkdown ? decodeUnicodeEscapes(article.bodyMarkdown) : null,
});

export const decodeCategorySummaries = (
  categories: SupabaseCategorySummary[]
): SupabaseCategorySummary[] =>
  categories.map((category) => ({
    ...category,
    slug: decodeUnicodeEscapes(category.slug),
    name: decodeUnicodeEscapes(category.name),
    articles: category.articles.map(decodeArticleSummary),
  }));

export const decodeArticleDetail = (
  detail: SupabaseArticleDetail
): SupabaseArticleDetail => ({
  ...detail,
  slug: decodeUnicodeEscapes(detail.slug),
  title: decodeUnicodeEscapes(detail.title),
  authorName: detail.authorName ? decodeUnicodeEscapes(detail.authorName) : null,
  preview: detail.preview ? decodeUnicodeEscapes(detail.preview) : null,
  excerpt: detail.excerpt ? decodeUnicodeEscapes(detail.excerpt) : null,
  headerImagePath: detail.headerImagePath
    ? decodeUnicodeEscapes(detail.headerImagePath)
    : null,
  bodyMarkdown: decodeUnicodeEscapes(detail.bodyMarkdown),
  bodyJson: detail.bodyJson ? decodeUnicodeEscapes(detail.bodyJson) : null,
  bodyHtml: detail.bodyHtml ? decodeUnicodeEscapes(detail.bodyHtml) : null,
  categories: detail.categories.map((category) => ({
    ...category,
    slug: decodeUnicodeEscapes(category.slug),
    name: decodeUnicodeEscapes(category.name),
  })),
  relatedArticles: detail.relatedArticles.map((relation) => ({
    ...relation,
    relatedSlug: decodeUnicodeEscapes(relation.relatedSlug),
    title: decodeUnicodeEscapes(relation.title),
  })),
  media: detail.media.map((entry) => ({
    ...entry,
    storagePath: decodeUnicodeEscapes(entry.storagePath),
    caption: entry.caption ? decodeUnicodeEscapes(entry.caption) : null,
    credit: entry.credit ? decodeUnicodeEscapes(entry.credit) : null,
    altText: entry.altText ? decodeUnicodeEscapes(entry.altText) : null,
  })),
});

export const toLocalDateTimeInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const fromLocalDateTime = (value: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

export const formatDateTime = (value: string | null): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const toPreviewText = (article: { excerpt: string | null; preview: string | null; bodyMarkdown?: string | null }) => {
  const fallback = (article.bodyMarkdown ?? "")
    .replace(/^\s*```[\s\S]*?```\s*/gm, " ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\(([^)]+)\)/g, "$1")
    .replace(/[*_~`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (article.excerpt || article.preview || fallback || "Contenu non renseigné").replace(/\s+/g, " ").trim();
};

export const detailToForm = (detail: SupabaseArticleDetail): SupabaseFormState => ({
  title: decodeUnicodeEscapes(detail.title),
  slug: decodeUnicodeEscapes(detail.slug),
  authorName: decodeUnicodeEscapes(detail.authorName),
  status: detail.status,
  authoredDate: detail.authoredDate ?? "",
  publishedAt: toLocalDateTimeInput(detail.publishedAt ?? null),
  preview: decodeUnicodeEscapes(detail.preview),
  excerpt: decodeUnicodeEscapes(detail.excerpt),
  headerImagePath: decodeUnicodeEscapes(detail.headerImagePath),
  bodyMarkdown: decodeUnicodeEscapes(detail.bodyMarkdown),
  bodyJson: decodeUnicodeEscapes(detail.bodyJson),
  bodyHtml: decodeUnicodeEscapes(detail.bodyHtml),
  categoryIds: detail.categories.map((category) => category.id),
  relatedArticleIds: detail.relatedArticles.map((relation) => relation.relatedId),
});

export const bioToForm = (entry: SupabaseBioEntry): BioFormState => ({
  id: entry.id,
  slug: entry.slug,
  name: entry.name,
  role: entry.role ?? "",
  rank: String(entry.rank),
  portraitBase: entry.portraitBase ?? "",
  bioText: entry.bio.join("\n\n"),
});
