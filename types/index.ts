// /types/index.ts
export type Article = {
  title: string
  slug: string
  category: string
  date: string
  author: string
  preview: string
  headerImage?: string   // optional URL for header image
}

export type Category = {
  name: string
  color: string
}