export type SupabaseArticleSummary = {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  status: boolean;
  authoredDate: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  preview: string | null;
  excerpt: string | null;
  headerImagePath: string | null;
  sortOrder: number;
};

export type SupabaseCategorySummary = {
  id: string;
  slug: string;
  name: string;
  color: string;
  sortOrder: number;
  articles: SupabaseArticleSummary[];
};

export type SupabaseArticleMedia = {
  id: string;
  storageBucket: string;
  storagePath: string;
  caption: string | null;
  credit: string | null;
  altText: string | null;
  isHeader: boolean;
  sortOrder: number;
};

export type SupabaseArticleRelation = {
  relatedId: string;
  relatedSlug: string;
  title: string;
  status: boolean;
  sortOrder: number;
};

export type SupabaseArticleDetail = {
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
  status: boolean;
  authoredDate: string | null;
  publishedAt: string | null;
  preview: string | null;
  excerpt: string | null;
  headerImagePath: string | null;
  bodyMarkdown: string;
  bodyJson: string | null;
  bodyHtml: string | null;
  categories: Array<{ id: string; slug: string; name: string; color: string; sortOrder: number }>;
  relatedArticles: SupabaseArticleRelation[];
  media: SupabaseArticleMedia[];
  createdAt: string;
  updatedAt: string;
};

export type SupabaseArticleUpsertPayload = {
  title: string;
  slug: string;
  authorName: string | null;
  status: boolean;
  authoredDate: string | null;
  publishedAt: string | null;
  preview: string | null;
  excerpt: string | null;
  headerImagePath: string | null;
  bodyMarkdown: string;
  bodyJson: string | null;
  bodyHtml: string | null;
  categoryIds: string[];
  relatedArticleIds: string[];
};

export type SupabaseArticleCreatePayload = SupabaseArticleUpsertPayload;
