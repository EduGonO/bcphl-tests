// pages/[...paths].tsx
import React, { useMemo, useState } from "react";
import Script from "next/script";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import TopNav from "../app/components/TopNav";
import Footer from "../app/components/Footer";
import ArticleGrid from "../app/components/ArticleGrid";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
import { Article, Category } from "../types";
import {
  loadPublicArticleBySlug,
  loadPublicContent,
} from "../lib/supabase/publicContent";

interface ArtProps {
  article: Article;
  category: string;
  content: string;
  gridArticles: Article[];
  categories: Category[];
  searchArticles: Article[];
  supabaseError?: string | null;
}

const ArticlePage: React.FC<ArtProps> = ({
  article,
  category,
  content,
  gridArticles,
  categories,
  searchArticles,
  supabaseError,
}) => {
  const [query, setQuery] = useState("");

  const formattedDate = useMemo(() => {
    if (!article.date || article.date === "Unknown Date") {
      return "";
    }

    const parsed = Date.parse(article.date);
    if (!Number.isNaN(parsed)) {
      try {
        return new Date(parsed).toLocaleDateString("fr-FR", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      } catch (error) {
        return article.date;
      }
    }

    return article.date;
  }, [article.date]);

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

  const heroImage = article.headerImage || (article.media.length > 0 ? article.media[0] : "");
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
        <title>{article.title}</title>
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
              {supabaseError && (
                <div className="article-error" role="alert">
                  <p>{supabaseError}</p>
                </div>
              )}
              <header className="article-hero" style={{ backgroundColor: backdropColor }}>
                <div className={`article-hero-inner${hasHeroImage ? "" : " no-media"}`}>
                  <div className="article-hero-content">
                    <div className="article-hero-header">
                      <h1 className="article-title">{article.title}</h1>
                      {article.author && <p className="article-author">{article.author}</p>}
                    </div>
                    {formattedDate && (
                      <time className="article-date" dateTime={article.date}>
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
                      <div className="article-hero-media placeholder" aria-hidden="true">
                        <span className="placeholder-label">Illustration</span>
                      </div>
                      */}
                    </>
                  )}
                </div>
              </header>

              <section className="article-body">
                <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />
              </section>
            </article>

            <aside className="article-sidebar">
              <div className="sidebar-section">
                <h2>Dans la même rubrique</h2>
                <div className="sidebar-highlight" style={{ backgroundColor: accentColor }} />
              </div>

              <ArticleGrid articles={gridArticles} categories={categories} />
            </aside>
          </div>
        </main>

        <Footer footerColor="#0c0c0c" />
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
          padding: 0;
          background: #ffffff;
        }
        .article-layout {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 400px);
          gap: 40px;
          padding: 40px clamp(24px, 7vw, 88px) 60px;
          background: #f3f3f3;
        }
        .article {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .article-error {
          background: #ffe0e0;
          border: 1px solid rgba(255, 17, 34, 0.2);
          color: #5f2121;
          font-family: "InterRegular", sans-serif;
          padding: 12px 16px;
          border-radius: 12px;
          margin: 16px 16px 0;
        }
        .article-hero {
          position: relative;
          overflow: hidden;
        }
        .article-hero-inner {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
          align-items: stretch;
        }
        .article-hero-inner.no-media {
          grid-template-columns: minmax(0, 1fr);
        }
        .article-hero-content {
          padding: clamp(24px, 7vw, 56px) clamp(24px, 6vw, 64px);
          display: flex;
          flex-direction: column;
          gap: 24px;
          justify-content: center;
        }
        .article-hero-header {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .article-title {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1.1;
          color: #1a1714;
        }
        .article-author {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: 18px;
          color: rgba(26, 23, 20, 0.75);
        }
        .article-date {
          font-family: "InterRegular", sans-serif;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26, 23, 20, 0.7);
        }
        .article-hero-media {
          position: relative;
          min-height: 240px;
          background-color: rgba(255, 255, 255, 0.4);
        }
        .article-hero-media.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: "InterRegular", sans-serif;
          color: rgba(26, 23, 20, 0.6);
        }
        .article-body {
          padding: clamp(32px, 8vw, 80px);
          font-family: "InterRegular", sans-serif;
          color: #1c1a16;
        }
        .article-content :global(p) {
          font-size: 18px;
          line-height: 1.7;
          margin: 0 0 1.4em;
        }
        .article-content :global(h2),
        .article-content :global(h3),
        .article-content :global(h4) {
          font-family: "GayaRegular", serif;
          margin: 1.8em 0 0.8em;
        }
        .article-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-family: "InterRegular", sans-serif;
        }
        .sidebar-section h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(26, 23, 20, 0.72);
        }
        .sidebar-highlight {
          width: 60px;
          height: 4px;
          border-radius: 999px;
        }
        @media (max-width: 1040px) {
          .article-layout {
            grid-template-columns: minmax(0, 1fr);
            padding: 32px 24px 60px;
          }
          .article-sidebar {
            order: -1;
          }
        }
        @media (max-width: 720px) {
          .article-hero-inner {
            grid-template-columns: minmax(0, 1fr);
          }
          .article-hero-media {
            min-height: 200px;
          }
        }
      `}</style>
    </>
  );
};

export default ArticlePage;

export const getServerSideProps: GetServerSideProps<ArtProps> = async ({ params }) => {
  const pathParams = (params?.paths as string[]) || [];
  if (pathParams.length < 2) {
    return { notFound: true };
  }

  const [requestedCategory, slug] = pathParams;

  try {
    const [detail, content] = await Promise.all([
      loadPublicArticleBySlug(slug),
      loadPublicContent(),
    ]);

    if (!detail) {
      return { notFound: true };
    }

    const article = detail.article;

    if (
      article.category &&
      requestedCategory &&
      article.category.toLowerCase() !== requestedCategory.toLowerCase()
    ) {
      const categoryMatch = detail.categories.some(
        (cat) => cat.slug?.toLowerCase() === requestedCategory.toLowerCase()
      );
      if (!categoryMatch) {
        return { notFound: true };
      }
    }

    const normalizedCategories: Category[] = content.categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.slug ?? category.name,
      color: category.color,
    }));

    const gridArticles = content.categories
      .find((cat) => cat.slug?.toLowerCase() === article.category.toLowerCase())
      ?.articles.filter((item) => item.slug !== article.slug) ?? [];

    const searchArticles = content.articles.filter((item) => item.slug !== article.slug);

    return {
      props: {
        article,
        category: requestedCategory,
        content: detail.contentHtml,
        gridArticles,
        categories: normalizedCategories,
        searchArticles,
        supabaseError: null,
      },
    };
  } catch (error) {
    return {
      props: {
        article: {
          id: "",
          slug,
          category: requestedCategory,
          categoryName: "",
          title: "Article indisponible",
          date: "",
          author: "",
          preview: "",
          media: [],
          headerImage: "",
          excerpt: null,
          publishedAt: null,
          authoredDate: null,
          updatedAt: null,
        },
        category: requestedCategory,
        content: "",
        gridArticles: [],
        categories: [],
        searchArticles: [],
        supabaseError:
          error instanceof Error ? error.message : "Impossible de charger l’article demandé.",
      },
    };
  }
};
