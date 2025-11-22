// /pages/index-archive.tsx
import React, { useState } from "react";
import Head from "next/head";
import Header, { Category } from "../app/components/Header-2";
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

const IndexArchive: React.FC<HomeProps> = ({ articles, categories }) => {
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [layout, setLayout] = useState<"vertical" | "horizontal">("horizontal");
  const [bodyFontSize, setBodyFontSize] = useState<number>(16);
  const [bodyFont, setBodyFont] = useState<
    "EnbyGertrude" | "AvenirNextCondensed"
  >("EnbyGertrude");
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
        <title>Bicéphale · Accueil (Archive)</title>
        {/* Additional meta tags, scripts, etc. */}
        <meta
          name="description"
          content="Revue Bicéphale, 2025"
        />

        {/* Open Graph (Facebook, LinkedIn, Slack, etc.) */}
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="Bicéphale" />
        <meta property="og:title"       content="Bicéphale" />
        <meta property="og:description" content="Revue Bicéphale, 2025" />
        <meta property="og:url"         content="https://bicephale.org" />

        {/* Twitter Card */}
        <meta name="twitter:title"       content="Bicéphale" />
        <meta name="twitter:description" content="Revue Bicéphale, 2025" />

        {/* Favicon from earlier */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
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
{/*
          <div>
            <ArticleBlock
              articles={articles}
              categories={categories}
              titleFont="RecoletaMedium"
            />
          </div>
*/}
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
          {/*
          <CategoryArticlePreview
            articles={filteredArticles}
            categories={categories}
            titleFont="GayaRegular"
          />
          
          <ArticleList
            articles={filteredArticles}
            categories={categories}
            titleFont={titleFont}
          />
          
            <CategoryArticleCompact
              articles={articles}
              categories={categories}
              titleFont="GayaRegular"
            />
      */}
          <div>
            {/* Some logic to decide if you want to show the grid vs. list */}
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

export async function getServerSideProps() {
  const { articles, categories } = await getArticleData();
  return { props: { articles, categories } };
}

export default IndexArchive;
