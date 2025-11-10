// pages/[...paths].tsx
import React, { useMemo, useState } from "react";
import Script from "next/script";
import Head from "next/head";
import type { GetStaticPaths, GetStaticProps } from "next";
import TopNav from "../app/components/TopNav";
import Footer from "../app/components/Footer";
import ArticleGrid from "../app/components/ArticleGrid";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
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

  const searchArticles = articles.filter(
    (article) =>
      !(article.slug === record.article.slug &&
        article.category.toLowerCase() === record.article.category.toLowerCase())
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
      searchArticles,
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
  searchArticles: Article[];
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
  searchArticles,
}) => {
  const [query, setQuery] = useState("");

  const formattedDate = useMemo(() => {
    if (!date || date === "Unknown Date") {
      return "";
    }

    const parsed = Date.parse(date);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toLocaleDateString("fr-FR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    return date;
  }, [date]);

  const hexToRgba = (hex: string, alpha: number): string => {
    let r = 0;
    let g = 0;
    let b = 0;

    if (hex.length === 7) {
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const articleColor =
    categories.find(
      (current) => current.name.toLowerCase() === category.toLowerCase()
    )?.color || "#d4d4d4";

  const backdropColor = hexToRgba(articleColor, 0.18);
  const accentColor = hexToRgba(articleColor, 0.8);

  const heroImage = headerImage || (media && media.length > 0 ? media[0] : "");
  const hasHeroImage = Boolean(heroImage);
  const heroMediaStyle = hasHeroImage
    ? {
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <>
      <Head>
        <title>{title}</title>
        <script
          type="application/json"
          className="js-hypothesis-config"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({ openSidebar: false }),
          }}
        />
      </Head>
      <Script src="https://hypothes.is/embed.js" strategy="afterInteractive" />

      <div className="page-wrapper">
        <TopNav />

        <main className="content">
          <RedesignSearchSidebar
            query={query}
            onQueryChange={setQuery}
            searchLabel="Rechercher dans la revue"
            placeholder="Titre, auteur, mot-clé…"
            articles={searchArticles}
          />

          <div className="article-layout">
            <article className="article">
              <header className="article-hero" style={{ backgroundColor: backdropColor }}>
                <div className={`article-hero-inner${hasHeroImage ? "" : " no-media"}`}>
                  <div className="article-hero-content">
                    <div className="article-hero-header">
                      <h1 className="article-title">{title}</h1>
                      {author && <p className="article-author">{author}</p>}
                    </div>
                    {formattedDate && (
                      <time className="article-date" dateTime={date}>
                        {formattedDate}
                      </time>
                    )}
                  </div>
                  {hasHeroImage ? (
                    <div
                      className="article-hero-media"
                      style={heroMediaStyle}
                      aria-hidden="true"
                    />
                  ) : (
                    <>
                      {/** Placeholder hero media intentionally commented out for future reuse.
                       * <div
                       *   className="article-hero-media"
                       *   style={{
                       *     backgroundImage: `linear-gradient(135deg, ${hexToRgba(
                       *       articleColor,
                       *       0.55
                       *     )} 0%, ${hexToRgba(articleColor, 0.25)} 100%)`,
                       *   }}
                       *   aria-hidden="true"
                       * />
                       */}
                    </>
                  )}
                </div>
              </header>

              <section className="article-body-wrapper">
                <div
                  className="article-body"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </section>
            </article>

            {gridArticles.length > 0 && (
              <section className="related-articles">
                <div className="related-articles-inner">
                  <h2 className="related-heading">Dans la même rubrique</h2>
                  <ArticleGrid
                    articles={gridArticles}
                    categories={categories}
                    titleFont="GayaRegular"
                  />
                </div>
              </section>
            )}
          </div>
        </main>

        <Footer footerColor="#0c0c0c" marginTop="0" />
      </div>

      <style jsx>{`
        :global(body) {
          background: #ffffff;
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .content {
          flex: 1;
          display: flex;
          gap: 0;
          background: #ffffff;
        }

        .article-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #e8e8e8;
        }

        .article {
          --article-max-width: 720px;
          --article-horizontal-padding: clamp(32px, 10vw, 140px);
          --article-hero-vertical-padding: clamp(36px, 6vw, 72px);
          --article-body-padding-top: clamp(44px, 8vw, 92px);
          --article-body-padding-bottom: clamp(36px, 7vw, 88px);
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .article-hero {
          padding: var(--article-hero-vertical-padding) 0;
          background: ${backdropColor};
        }

        .article-hero-inner {
          display: flex;
          width: 100%;
          box-sizing: border-box;
          align-items: stretch;
          gap: clamp(24px, 4vw, 48px);
          padding-left: calc(
            (100% - min(var(--article-max-width), 100%)) / 2
          );
          padding-right: clamp(16px, 4vw, 40px);
        }

        .article-hero-inner.no-media {
          gap: clamp(20px, 4vw, 28px);
          justify-content: center;
          width: min(
            calc(var(--article-max-width) + var(--article-horizontal-padding) * 2),
            100%
          );
          margin: 0 auto;
          padding: 0 var(--article-horizontal-padding);
        }

        .article-hero-content {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: clamp(18px, 4vw, 28px);
          color: #0d0d0d;
          flex: 1 1 var(--article-max-width);
          max-width: var(--article-max-width);
          width: 100%;
          margin: 0;
        }

        .article-hero-inner.no-media .article-hero-content {
          margin: 0 auto;
        }

        .article-hero-header {
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 3vw, 20px);
        }

        .article-title {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: clamp(34px, 5.6vw, 64px);
          line-height: 1.08;
          font-weight: 400;
          color: #111111;
          text-align: left;
        }

        .article-author {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: clamp(16px, 2.4vw, 22px);
          letter-spacing: 0.01em;
          text-align: right;
          color: rgba(17, 17, 17, 0.78);
        }

        .article-date {
          font-family: "InterRegular", sans-serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(17, 17, 17, 0.68);
        }

        .article-hero-media {
          flex: 0 0 clamp(220px, 28vw, 360px);
          border-radius: 26px;
          background-color: rgba(255, 255, 255, 0.68);
          min-height: clamp(220px, 32vw, 380px);
          box-shadow: inset 0 0 0 1px rgba(17, 17, 17, 0.08);
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
        }

        .article-body-wrapper {
          padding: var(--article-body-padding-top) var(--article-horizontal-padding)
            var(--article-body-padding-bottom);
          background: #f9f9f9;
        }

        .article-body {
          max-width: 720px;
          margin: 0 auto;
          font-family: "InterRegular", sans-serif;
          font-size: 18px;
          line-height: 1.68;
          color: #111111;
        }

        .article-body :global(p) {
          margin: 0 0 1.8em;
        }

        .article-body :global(h2) {
          margin: 2.4em 0 1.2em;
          font-family: "GayaRegular", serif;
          font-size: 30px;
          font-weight: 400;
          color: #111111;
          line-height: 1.2;
        }

        .article-body :global(h3) {
          margin: 2em 0 1em;
          font-family: "GayaRegular", serif;
          font-size: 24px;
          font-weight: 400;
          color: #111111;
        }

        .article-body :global(a) {
          color: ${accentColor};
          text-decoration: none;
          border-bottom: 1px solid rgba(17, 17, 17, 0.18);
          transition: border-color 0.2s ease;
        }

        .article-body :global(a:hover),
        .article-body :global(a:focus-visible) {
          border-color: ${accentColor};
        }

        .article-body :global(blockquote) {
          margin: 2.4em 0;
          padding: 20px 28px 20px 32px;
          border-left: 4px solid ${accentColor};
          background: ${hexToRgba(articleColor, 0.16)};
          border-radius: 6px;
          font-style: italic;
        }

        .article-body :global(img) {
          display: block;
          max-width: min(100%, 520px);
          margin: 2.4em auto;
          border-radius: 18px;
          box-shadow: 0 14px 30px rgba(17, 17, 17, 0.12);
        }

        .related-articles {
          padding: clamp(48px, 7vw, 92px) clamp(32px, 8vw, 96px) clamp(64px, 9vw, 120px);
          background: #ffffff;
        }

        .related-articles-inner {
          width: min(1120px, 100%);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .related-heading {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: 28px;
          font-weight: 400;
          color: #111111;
          letter-spacing: 0.02em;
        }

        @media (max-width: 1340px) {
          .article-hero-inner {
            flex-direction: column;
            width: 100%;
            padding: 0 var(--article-horizontal-padding);
          }

          .article-hero-inner.no-media {
            width: 100%;
          }

          .article-hero-content {
            margin: 0 auto;
          }

          .article-hero-media {
            width: 100%;
            flex: 0 0 auto;
            min-height: clamp(220px, 54vw, 340px);
            order: -1;
          }
        }

        @media (max-width: 720px) {
          .content {
            flex-direction: column;
          }

          .article {
            --article-horizontal-padding: clamp(20px, 8vw, 48px);
            --article-body-padding-top: clamp(36px, 10vw, 64px);
            --article-body-padding-bottom: clamp(24px, 8vw, 48px);
          }

          .article-layout {
            background: #f0f0f0;
          }

          .article-body {
            font-size: 17px;
          }

          .related-articles {
            padding: clamp(40px, 10vw, 72px) clamp(20px, 8vw, 48px);
          }
        }

        @media (max-width: 520px) {
          .article {
            --article-hero-vertical-padding: clamp(28px, 12vw, 52px);
          }

          .article-title {
            font-size: clamp(30px, 9vw, 40px);
          }

          .article-author {
            font-size: clamp(15px, 5vw, 18px);
          }
        }
      `}</style>
    </>
  );
};

export default ArticlePage;
