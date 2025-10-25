// pages/[...paths].tsx
import React, { useState } from "react";
import Script from "next/script";
import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
import TopNav from "../app/components/TopNav";
import Footer from "../app/components/Footer";
import ArticleGrid from "../app/components/ArticleGrid";
import {
  findArticleRecord,
  getArticleData,
  getArticleRecords,
} from "../lib/articleService";
import { Article, Category } from "../types";
import { mdToHtml } from "../lib/markdown";

/* ── static paths ─────────────────────────────────────────────────── */

export const getStaticPaths: GetStaticPaths = async () => {
  const records = getArticleRecords();
  const paths = records.map((record) => ({
    params: { paths: [record.article.category, record.article.slug] },
  }));

  return { paths, fallback: false };
};

/* ----- getStaticProps ------------------------------------------ */

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const [category, slug] = (params?.paths as string[]) || [];
  if (!category || !slug) {
    return { notFound: true };
  }

  const record = findArticleRecord(category, slug);
  if (!record) {
    return { notFound: true };
  }

  const contentHtml = mdToHtml(record.body, record.publicBasePath);

  const { articles, categories } = getArticleData();
  const gridArticles = articles.filter(
    (article) =>
      article.category.toLowerCase() === record.article.category.toLowerCase() &&
      article.slug !== record.article.slug
  );

  return {
    props: {
      title: record.article.title,
      date: record.article.date,
      author: record.article.author,
      headerImage: record.article.headerImage,
      media: record.article.media,
      category: record.article.category,
      content: contentHtml,
      gridArticles,
      categories,
    },
  };
};

/* ── React page ───────────────────────────────────────────────────── */

interface ArtProps {
  title: string;
  date: string;
  author: string;
  headerImage: string;
  media: string[];
  category: string;
  content: string;
  gridArticles: Article[];
  categories: Category[];
}

const ArticlePage: React.FC<ArtProps> = ({
  title,
  date,
  author,
  headerImage,
  media,
  category,
  content,
  gridArticles,
  categories,
}) => {
  const [bodyFontSize, setBodyFontSize] = useState<number>(18);
  const [bodyFont, setBodyFont] = useState<
    "InterRegular" | "AvenirNextCondensed"
  >("InterRegular");
  const [titleFont, setTitleFont] = useState<
    "RecoletaMedium" | "GayaRegular"
  >("GayaRegular");

  // Parse date properly
  const formattedDate = date !== "Unknown Date" 
    ? new Date(date).toLocaleDateString("fr-FR", {
        month: "long", 
        day: "numeric",
        year: "numeric",
      })
    : "";

  const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const articleColor =
    categories.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    )?.color || "#f0f0f0";
  const backdropColor = hexToRgba(articleColor, 0.1);
  const accentColor = hexToRgba(articleColor, 0.9);

  return (
    <>
      <Head>
        <title>{title}</title>
        {/* Hypothesis config (optional) */}
        <script
          type="application/json"
          className="js-hypothesis-config"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ openSidebar: false }),
          }}
        />
      </Head>
      <Script
        src="https://hypothes.is/embed.js"
        strategy="afterInteractive"
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: '#fff',
          fontSize: `${bodyFontSize}px`,
          fontFamily: bodyFont,
        }}
      >
        <TopNav />

        {/* Hero section with header image - now full width */}
        <div 
          className="article-hero" 
          style={{ 
            backgroundImage: headerImage ? `url(${headerImage})` : undefined,
            backgroundColor: backdropColor
          }}
        >
          <div className="article-hero-overlay" />
          <div className="article-hero-content">

            <div className="article-category" style={{ color: accentColor }}>
              {category}
            </div>

            <h1 className="article-title">{title}</h1>
            <div className="article-meta">
              <span className="article-author">{author}</span>
              <span className="article-date">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Main content - narrower container */}
        <div className="article-body-container">
          <div className="article-body">
          <div
  className="article-body"
  dangerouslySetInnerHTML={{ __html: content }}
/>

          </div>
        </div>

        {/* Related articles - container for proper alignment */}
        <div className="container">
          <div className="related-articles">
            <ArticleGrid articles={gridArticles} categories={categories} titleFont="GayaRegular" />
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .article-hero {
          position: relative;
          height: 420px;
          background-size: cover;
          background-position: center;
          width: 100%;
          margin-top: 20px;
          overflow: hidden;
        }

        .article-hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.8) 90%);
        }

        .article-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          max-width: 900px;
          margin: 0 auto;
          padding: 60px 24px;
          color: white;
          text-align: center;
        }

        .article-category {
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          background-color: rgba(255, 255, 255, 0.84);
          padding: 8px 16px;
          border-radius: 4px;
          margin-bottom: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .article-title {
          font-family: ${titleFont};
          font-size: 46px;
          line-height: 1.2;
          margin: 0 0 24px;
          font-weight: normal;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .article-meta {
          font-size: 16px;
          opacity: 0.9;
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .article-author {
          font-weight: 500;
        }

        .article-author:after {
          content: "•";
          margin-left: 16px;
          opacity: 0.7;
        }

        .article-body-container {
          margin: 60px auto;
          max-width: 690px;
          padding: 0 24px;
        }

        .article-body {
          font-size: ${bodyFontSize}px;
          line-height: 1.5;
          color: #333;
        }

        .article-body p {
          margin-bottom: 1.8em;
        }

        .article-body h2 {
          font-family: ${titleFont};
          font-size: 32px;
          margin: 2em 0 1em;
          font-weight: normal;
          color: #222;
        }

        .article-body h3 {
          font-family: ${titleFont};
          font-size: 26px;
          margin: 1.8em 0 0.8em;
          font-weight: normal;
          color: #333;
        }

        .article-body a {
          color: ${accentColor};
          text-decoration: none;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          transition: border-color 0.2s ease;
        }

        .article-body a:hover {
          border-color: ${accentColor};
        }

.article-body img {
    max-width: 50%;   /* never overflow column */
    height: auto;      /* keep aspect ratio */
    display: block;    /* remove inline-gap */
    margin: 1rem auto; /* optional centering */
  }
        .article-body img {
          max-width: 50%;
          height: auto;
          border-radius: 8px;
          margin: 2em 0;
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .article-body blockquote {
          margin: 2em 0;
          padding: 16px 24px 16px 32px;
          border-left: 4px solid ${accentColor};
          background-color: ${backdropColor};
          font-style: italic;
          border-radius: 4px;
        }

        .related-articles {
          margin: 80px 0 60px;
        }

        .related-articles h2 {
          font-family: ${titleFont};
          font-size: 36px;
          margin-bottom: 40px;
          font-weight: normal;
          text-align: center;
          color: #222;
        }

        @media (max-width: 768px) {
          .article-hero {
            height: 400px;
          }

          .article-hero-content {
            padding: 40px 20px;
          }

          .article-title {
            font-size: 36px;
          }

          .article-meta {
            flex-direction: column;
            gap: 8px;
          }

          .article-author:after {
            display: none;
          }

          .article-body-container {
            margin: 40px auto;
          }

          .article-body {
            font-size: 17px;
          }
        }

        @media (max-width: 480px) {
          .article-hero {
            height: 300px;
          }

          .article-title {
            font-size: 32px;
          }

          .article-body-container {
            padding: 0 16px;
          }
        }

  .article-body img {
    max-width: 100%;   /* never overflow column */
    height: auto;      /* keep aspect ratio */
    display: block;    /* remove inline-gap */
    margin: 1rem 0;    /* optional spacing */
  }
      `}</style>
    </>
  );
};

export default ArticlePage;