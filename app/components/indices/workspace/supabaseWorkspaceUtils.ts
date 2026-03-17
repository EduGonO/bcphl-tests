import type { SupabaseArticleDetail, SupabaseBioEntry } from "../../../../types/supabase";
import type { BioFormState, SupabaseFormState } from "./supabaseWorkspaceTypes";

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
  title: detail.title ?? "",
  slug: detail.slug ?? "",
  authorName: detail.authorName ?? "",
  status: detail.status,
  authoredDate: detail.authoredDate ?? "",
  publishedAt: toLocalDateTimeInput(detail.publishedAt ?? null),
  preview: detail.preview ?? "",
  excerpt: detail.excerpt ?? "",
  headerImagePath: detail.headerImagePath ?? "",
  bodyMarkdown: detail.bodyMarkdown ?? "",
  bodyJson: detail.bodyJson ?? "",
  bodyHtml: detail.bodyHtml ?? "",
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
