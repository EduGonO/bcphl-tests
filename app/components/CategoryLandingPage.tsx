"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";

import { Article } from "../../types";
import Footer from "./Footer";
import RedesignArticlePreviewCard from "./RedesignArticlePreviewCard";
import RedesignSearchSidebar from "./RedesignSearchSidebar";
import TopNav from "./TopNav";

interface CategoryLandingPageProps {
  articles: Article[];
  introContent?: ReactNode;
  columnTitle: string;
  variant?: "reflexion" | "creation";
}

const parseDate = (value: string) => {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return parsed;
  }
  const normalized = value.replace(/(\d{1,2})\s([A-Za-zéûôà]+)\s(\d{4})/, "$3-$2-$1");
  const fallback = Date.parse(normalized);
  return Number.isNaN(fallback) ? 0 : fallback;
};

const formatDate = (value: string) => {
  const timestamp = parseDate(value);
  if (!timestamp) {
    return value;
  }
  try {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return value;
  }
};

const CategoryLandingPage = ({
  articles,
  introContent,
  columnTitle,
  variant = "reflexion",
}: CategoryLandingPageProps) => {
  const [query, setQuery] = useState("");

  const hasIntro = Boolean(introContent);

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (article: Article) => {
    if (!normalizedQuery) return true;
    const haystack = [article.title, article.author, article.preview]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  };

  const sortedArticles = useMemo(
    () => [...articles].sort((a, b) => parseDate(b.date) - parseDate(a.date)),
    [articles]
  );

  const filteredArticles = useMemo(
    () => sortedArticles.filter(matchesQuery),
    [sortedArticles, normalizedQuery]
  );

  return (
    <div className="page-wrapper">
      <TopNav />

      <main className="content">
        <RedesignSearchSidebar query={query} onQueryChange={setQuery} />

        <div
          className={`main-sections ${
            hasIntro ? "with-intro" : "without-intro"
          }`}
        >
          {hasIntro && (
            <section className="intro">
              <div className="intro-copy">
                <div className="intro-text">{introContent}</div>
                <div className="intro-actions">
                  <Link href="/categories/info" className="intro-action">
                    <span className="intro-action-pill featured">manifeste</span>
                  </Link>
                  <Link href="/evenements" className="intro-action">
                    <span className="intro-action-pill event">nous suivre</span>
                  </Link>
                </div>
              </div>
            </section>
          )}

          <section className="columns-area">
            <div className="single-column">
              <header className="column-header">
                <h2>{columnTitle}</h2>
                <span className="column-count">{filteredArticles.length}</span>
              </header>
              <div className="column-content">
                {filteredArticles.map((article) => (
                  <RedesignArticlePreviewCard
                    key={article.slug}
                    article={article}
                    variant={variant}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer footerColor="#0c0c0c" />

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
        .main-sections {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 52px;
          background: #e4e4e4;
        }
        .main-sections.without-intro {
          gap: 0;
        }
        .intro {
          display: flex;
          justify-content: center;
          padding: 48px clamp(24px, 7vw, 88px) 0;
        }
        .intro-copy {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 640px;
          width: 100%;
        }
        .intro-text {
          font-family: "InterRegular", sans-serif;
          color: #211f18;
          line-height: 1.56;
          font-size: 16px;
        }
        .intro-text p {
          margin: 0 0 16px;
        }
        .intro-text em {
          font-style: italic;
        }
        .intro-highlight {
          font-family: "GayaRegular", serif;
          font-style: normal;
          font-size: 18px;
        }
        .intro-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .intro-action {
          text-decoration: none;
        }
        .intro-action-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 22px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: "InterMedium", sans-serif;
          font-size: 12px;
        }
        .intro-action-pill.featured {
          background: #c1c1f0;
          color: #111;
        }
        .intro-action-pill.event {
          background: #f4f0ae;
          color: #111;
        }
        .columns-area {
          display: flex;
          justify-content: center;
          padding: clamp(32px, 6vw, 64px) clamp(24px, 6vw, 72px)
            clamp(48px, 7vw, 72px);
          width: 100%;
          box-sizing: border-box;
        }
        .main-sections.with-intro .columns-area {
          padding-top: 0;
        }
        .single-column {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: min(640px, 100%);
        }
        .column-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          font-family: "GayaRegular", serif;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #2b2b2b;
        }
        .column-header h2 {
          margin: 0;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
        }
        .column-count {
          font-size: 14px;
          color: rgba(17, 17, 17, 0.72);
        }
        .column-content {
          display: grid;
          gap: 24px;
        }
        @media (max-width: 700px) {
          .content {
            flex-direction: column;
          }
          .intro {
            padding: 32px 24px 0;
          }
          .intro-copy {
            max-width: none;
          }
          .columns-area {
            padding: 0 24px 48px;
          }
        }
        :global(.page-wrapper a) {
          color: inherit;
          text-decoration: none;
        }
        :global(.page-wrapper a:visited) {
          color: inherit;
        }
        :global(.page-wrapper .footer) {
          margin-top: 0;
        }
      `}</style>
    </div>
  );
};

export default CategoryLandingPage;
