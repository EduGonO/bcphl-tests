"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Article } from "../../types";
import Footer from "./Footer";
import RedesignArticlePreviewCard from "./RedesignArticlePreviewCard";
import RedesignSearchSidebar from "./RedesignSearchSidebar";
import TopNav from "./TopNav";

type CategoryLandingVariant = "reflexion" | "creation" | "irl";

interface CategoryLandingPageProps {
  articles: Article[];
  introContent?: ReactNode;
  introHtml?: string | null;
  introMarkdown?: string | null;
  columnTitle: string;
  variant?: CategoryLandingVariant;
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
  introHtml,
  introMarkdown,
  columnTitle,
  variant = "reflexion",
}: CategoryLandingPageProps) => {
  const [query, setQuery] = useState("");
  const newsletterHref =
    "https://sibforms.com/serve/MUIFAGMMncdAyI0pK_vTiYnFqzGrGlrYzpHdjKLcy55QF9VlcZH4fBfK-qOmzJcslEcSzqsgO8T9qqWQhDm6Wivm1cKw7Emj1-aN4wdauAKe9aYW9DOrX1kGVOtzrKtN20MiOwOb_wYEKjIkEcCwmGHzk9FpEE_5XeOXDvgGfdMPgbbyoWykOn9ibDVITO5Ku0NZUfiBDZgP1nFF";

  const renderedIntro = useMemo(() => {
    if (introHtml) {
      return <div dangerouslySetInnerHTML={{ __html: introHtml }} />;
    }

    if (introMarkdown) {
      return <ReactMarkdown>{introMarkdown}</ReactMarkdown>;
    }

    return introContent;
  }, [introContent, introHtml, introMarkdown]);

  const hasIntro = Boolean(renderedIntro);

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
        <RedesignSearchSidebar
          query={query}
          onQueryChange={setQuery}
          articles={sortedArticles}
        />

        <div className={`main-sections ${hasIntro ? "with-intro" : "without-intro"}`}>
          <section className="columns-area">
            <div className="single-column">
              <header className="column-header">
                <h2>{columnTitle}</h2>
              </header>
              {hasIntro && (
                <section className="intro">
                  <div className="intro-copy">
                    <div className="intro-text">{renderedIntro}</div>
                    <div className="intro-actions">
                      <Link
                        href={newsletterHref}
                        className="intro-action"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-variant="featured"
                      >
                        <span className="intro-action-label">S'abonner</span>
                      </Link>
                      <Link
                        href="https://www.instagram.com/revue.bicephale?igsh=MTlhbmgxMXdhdDZybQ=="
                        className="intro-action"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-variant="event"
                      >
                        <img
                          src="/social/instagram.png"
                          alt=""
                          className="intro-action-icon"
                          aria-hidden="true"
                        />
                        <span className="intro-action-label">Nous suivre</span>
                      </Link>
                    </div>
                  </div>
                </section>
              )}
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
          background: #e4e4e4;
        }
        .intro {
          display: flex;
          justify-content: center;
          padding: 16px 0 8px;
        }
        .intro-copy {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 640px;
          width: 100%;
        }
        .intro-text {
          font-family: "EnbyGertrude", sans-serif;
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
          gap: 14px;
          margin: 16px 0 0;
          flex-wrap: wrap;
          align-items: center;
        }
        :global(.intro-action) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-direction: row;
          flex-wrap: nowrap;
          height: fit-content;
          text-decoration: none;
          cursor: pointer;
          border-radius: 999px;
          padding: 12px 22px;
          font-family: "EnbyGertrude", sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
          line-height: 1.1;
          color: #0f0f0f;
          background-color: #c1c1f0;
          border: 1px solid #c1c1f0;
          box-shadow: none;
          transition: background-color 0.2s ease, color 0.2s ease,
            box-shadow 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
        }
        :global(.intro-action:visited) {
          color: #0f0f0f;
        }
        :global(.intro-action:focus-visible) {
          outline: 2px solid rgba(17, 17, 17, 0.45);
          outline-offset: 2px;
        }
        :global(.intro-action-icon) {
          width: 18px;
          height: 18px;
          display: inline-block;
          object-fit: contain;
          flex-shrink: 0;
          align-self: center;
        }
        :global(.intro-action[data-variant="event"]) {
          background-color: #03b262;
          border-color: #03b262;
          color: #0f0f0f;
        }
        :global(.intro-action[data-variant="featured"]) {
          background-color: #c1c1f0;
          border-color: #c1c1f0;
          color: #0f0f0f;
        }
        :global(.intro-action:hover),
        :global(.intro-action:focus-visible),
        :global(.intro-action:active) {
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.18);
          transform: translateY(-1px);
        }
        :global(.intro-action[data-variant="featured"]:hover),
        :global(.intro-action[data-variant="featured"]:focus-visible),
        :global(.intro-action[data-variant="featured"]:active) {
          background-color: #c7b5f4;
          border-color: #c7b5f4;
        }
        :global(.intro-action[data-variant="event"]:hover),
        :global(.intro-action[data-variant="event"]:focus-visible),
        :global(.intro-action[data-variant="event"]:active) {
          background-color: #2ad07f;
          border-color: #2ad07f;
        }
        :global(.intro-action-label) {
          white-space: nowrap;
          line-height: 1.2;
          display: inline-block;
        }
        .columns-area {
          display: flex;
          justify-content: center;
          padding: clamp(32px, 6vw, 64px) clamp(24px, 6vw, 72px)
            clamp(48px, 7vw, 72px);
          width: 100%;
          box-sizing: border-box;
        }
        .single-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: min(640px, 100%);
          padding-top: clamp(12px, 2.8vw, 24px);
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
          font-size: clamp(2.1rem, 4.2vw, 2.9rem);
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
