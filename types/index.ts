// /types/index.ts
export type Article = {
  title: string;
  slug: string;
  category: string;
  date: string;
  author: string;
  preview: string;
  media: string[];        // new
  headerImage: string;    // new
};


export type Category = {
  name: string
  color: string
}