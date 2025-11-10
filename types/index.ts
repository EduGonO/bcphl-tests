// /types/index.ts
export type Article = {
  id: string;
  slug: string;
  category: string;
  categoryName: string;
  title: string;
  date: string;
  author: string;
  preview: string;
  media: string[];
  headerImage: string;
  excerpt: string | null;
  publishedAt: string | null;
  authoredDate: string | null;
  updatedAt: string | null;
};

export type Category = {
  id?: string;
  slug?: string;
  name: string;
  color: string;
};