import type { SupabaseBioEntry, SupabaseCategorySummary } from "../../../../types/supabase";

export type SupabaseFormState = {
  title: string;
  slug: string;
  authorName: string;
  status: boolean;
  authoredDate: string;
  publishedAt: string;
  preview: string;
  excerpt: string;
  headerImagePath: string;
  bodyMarkdown: string;
  bodyJson: string;
  bodyHtml: string;
  categoryIds: string[];
  relatedArticleIds: string[];
};

export type BioFormState = {
  id: string;
  slug: string;
  name: string;
  role: string;
  rank: string;
  portraitBase: string;
  bioText: string;
};

export type DirectoryArticle = {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  status: boolean;
  publishedAt: string | null;
  updatedAt: string | null;
  categories: Array<{ id: string; name: string; color: string }>;
  primaryCategoryId: string | null;
};

export type StatusTone = "idle" | "loading" | "saving" | "saved" | "dirty" | "error";
export type WorkspaceMode = "articles" | "bios";
export type SupabaseWorkspaceVariant = "writer" | "admin" | "master";

export type SupabaseWorkspaceEditorMode = "tiptap";

export type SupabaseWorkspaceProps = {
  categories: SupabaseCategorySummary[];
  bios?: SupabaseBioEntry[];
  error?: string | null;
  variant?: SupabaseWorkspaceVariant;
  editorMode?: SupabaseWorkspaceEditorMode;
};
