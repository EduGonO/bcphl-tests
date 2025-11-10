// /types/index.ts
export type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  date: string;
  author: string;
  preview: string;
  media: string[];
  headerImage: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  color: string;
};