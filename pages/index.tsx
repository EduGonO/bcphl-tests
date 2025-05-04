// /pages/index.tsx
import React, { useState } from "react";
import Head from "next/head";
import Header, { Category } from "../app/components/Header";
import DebugOverlay from "../app/components/DebugOverlay";
import Footer from "../app/components/Footer";
import ArticleList from "../app/components/ArticleList";
import { Article } from "../types";
import { getArticleData } from "../lib/articleService";
import ArticleGrid from "../app/components/ArticleGrid";
import ArticleBlock from "../app/components/ArticleBlock";
import CategoryBanner from "../app/components/CategoryBanner";
import CategoryArticlePreview from "../app/components/CategoryArticlePreview";
import CategoryArticleCompact from "../app/components/CategoryArticleCompact";
import MixedArticleShowcase from "../app/components/MixedArticleShowcase";
import NewsletterCategoryLayout from "../app/components/NewsletterCategoryLayout";

interface HomeProps {
  articles: Article[];
  categories: Category[];
}

const Home: React.FC<HomeProps> = ({ articles, categories }) => {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const [bodyFontSize, setBodyFontSize] = useState<number>(16);
  const [bodyFont, setBodyFont] = useState<
    "InterRegular" | "AvenirNextCondensed"
  >("InterRegular");
  const [titleFont, setTitleFont] = useState<"RecoletaMedium" | "GayaRegular">(
    "GayaRegular"
  );
  const [imagePreview, setImagePreview] = useState<boolean>(false);

  const handleCategoryChange = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      setFilteredArticles(articles);
      setBackgroundColor("#ffffff");
    } else {
      setActiveCategory(category);
      setFilteredArticles(articles.filter((a) => a.category === category));
      setBackgroundColor("#ffffff");
    }
  };

  const mainStyle: React.CSSProperties =
    layout === "vertical" ? { marginLeft: "250px" } : { marginTop: "0px" };

  return (
    <>
      <Head>
        <title>Bicéphale</title>
        {/* Additional meta tags, scripts, etc. */}
      </Head>
      <div
        style={{
          backgroundColor,
          transition: "background-color 0.3s ease",
          fontSize: `${bodyFontSize}px`,
          fontFamily: bodyFont,
        }}
      >
        <Header
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />
        <main style={mainStyle}>
          {activeCategory && <CategoryBanner category={activeCategory} />}
          <div>
            <ArticleBlock
              articles={articles}
              categories={categories}
              titleFont="RecoletaMedium"
            />
          </div>

          {/*
          <MixedArticleShowcase
            articles={articles}
            categories={categories}
            titleFont="GayaRegular"
          />
          <NewsletterCategoryLayout
            articles={articles}
            filteredArticles={filteredArticles}
            categories={categories}
            titleFont={titleFont}
          />
          <CategoryArticlePreview
            articles={filteredArticles}
            categories={categories}
            titleFont="GayaRegular"
          />
          */}
          
          <ArticleList
            articles={filteredArticles}
            categories={categories}
            titleFont={titleFont}
          />
          <div>
            {/* Some logic to decide if you want to show the grid vs. list */}
            <h1 style={{ fontFamily: "RecoletaMedium", marginLeft: "20px" }}>
              À lire également
            </h1>
            <ArticleGrid
              articles={filteredArticles}
              categories={categories}
              titleFont="GayaRegular"
            />
            <CategoryArticleCompact
              articles={articles}
              categories={categories}
              titleFont="GayaRegular"
            />
          </div>
          <Footer />
        </main>
      </div>
    </>
  );
};

export async function getStaticProps() {
  const { articles, categories } = getArticleData();
  return { props: { articles, categories } };
}

export default Home;
