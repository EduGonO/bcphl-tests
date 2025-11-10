// /pages/categories/[category].tsx
import React from "react";
import type { GetServerSideProps } from "next";
import { getArticleData } from "../../lib/articleService";
import { categoryConfigMap, categoryToSlug } from "../../config/categoryColors";
import SharedCategoryPage from "../../app/components/shared";
import Header, { Category } from "../../app/components/Header-2";
import Footer from "../../app/components/Footer";
import { Article } from "../../types";

interface CategoryEntryProps {
  category: string;
  articles: Article[];
  categories: Category[];
}

const CategoryEntry: React.FC<CategoryEntryProps> = ({ category, articles, categories }) => {
  const config = categoryConfigMap[category];
  if (!config) {
    return <div>Catégorie introuvable.</div>;
  }

  return (
    <>
      <Header categories={categories} />
      <SharedCategoryPage category={category} articles={articles} />
      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<CategoryEntryProps> = async ({ params }) => {
  const slugParam = typeof params?.category === "string" ? params.category : "";
  if (!slugParam) {
    return { notFound: true };
  }

  const normalizedSlug = slugParam.toLowerCase();
  const categoryName = Object.keys(categoryConfigMap).find(
    (name) => categoryToSlug(name).toLowerCase() === normalizedSlug
  );

  if (!categoryName) {
    return { notFound: true };
  }

  const config = categoryConfigMap[categoryName];
  if (config?.linkTo) {
    return {
      redirect: {
        destination: config.linkTo,
        permanent: false,
      },
    };
  }

  const { articles, categories } = await getArticleData();
  const filteredArticles = articles.filter((article) => {
    const slug = (article.categorySlug || categoryToSlug(article.category)).toLowerCase();
    const name = article.category.toLowerCase();
    return slug === normalizedSlug || name === categoryName.toLowerCase();
  });

  return {
    props: {
      category: categoryName,
      articles: filteredArticles,
      categories,
    },
  };
};

export default CategoryEntry;
