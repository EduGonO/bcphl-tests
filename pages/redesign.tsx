import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Footer from "../app/components/Footer";
import RedesignArticlePreviewCard from "../app/components/RedesignArticlePreviewCard";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
import TopNav from "../app/components/TopNav";
import { Article } from "../types";
import { findArticleRecord, getArticleRecords } from "../lib/articleService";

type ArticleWithBody = Article & {
  body?: string;
  bodyHtml?: string | null;
  bodyMarkdown?: string;
  content?: string;
  publicBasePath?: string;
  public_path?: string;
};

interface RedesignProps {
  articles: ArticleWithBody[];
}

const RedesignPage: React.FC<RedesignProps> = ({ articles }) => {
  const [query, setQuery] = useState("");
  const newsletterHref =
    "https://sibforms.com/serve/MUIFAGMMncdAyI0pK_vTiYnFqzGrGlrYzpHdjKLcy55QF9VlcZH4fBfK-qOmzJcslEcSzqsgO8T9qqWQhDm6Wivm1cKw7Emj1-aN4wdauAKe9aYW9DOrX1kGVOtzrKtN20MiOwOb_wYEKjIkEcCwmGHzk9FpEE_5XeOXDvgGfdMPgbbyoWykOn9ibDVITO5Ku0NZUfiBDZgP1nFF";

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

  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (article: ArticleWithBody) => {
    if (!normalizedQuery) return true;
    const haystack = [article.title, article.author, article.preview]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  };

  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => parseDate(b.date) - parseDate(a.date));
  }, [articles]);

  const getCategorySlug = (article: ArticleWithBody) =>
    (article.categorySlug || article.category)?.toLowerCase();

  const featuredArticles = useMemo(
    () =>
      sortedArticles.filter((article) => {
        const category = getCategorySlug(article);
        return (
          (category === "reflexion" || category === "creation") &&
          matchesQuery(article)
        );
      }),
    [sortedArticles, normalizedQuery]
  );

  const irlArticles = useMemo(
    () =>
      sortedArticles.filter(
        (article) => getCategorySlug(article) === "irl" && matchesQuery(article)
      ),
    [sortedArticles, normalizedQuery]
  );

  const getVariant = (article: ArticleWithBody) => {
    const category = getCategorySlug(article);
    if (category === "creation") return "creation" as const;
    if (category === "irl") return "irl" as const;
    return "reflexion" as const;
  };

  return (
    <>
      <Head>
        <title>Bicéphale · Accueil</title>
      </Head>
      <div className="page-wrapper">
        <TopNav />

        <main className="content">
          <RedesignSearchSidebar
            query={query}
            onQueryChange={setQuery}
            articles={sortedArticles}
          />

          <div className="main-sections">
            <section className="intro">
              <div className="intro-grid">
                <div className="intro-column intro-column-primary">
                  <p>
                    Dans la même urgence que la revue {" "}
                    <em className="intro-highlight">Acéphale</em> publiée par Georges Bataille
                    en 1936 et portée par un désir de la contribution propre à {" "}
                    <span className="intro-highlight">Bernard Stiegler</span>, la revue {" "}
                    <strong className="intro-highlight">BICÉPHALE</strong> conjugue la
                    créativité contemporaine à travers des textes inédits lors des soirées
                    bicéphales et une démarche réflexive analysant les arts, les techniques
                    et la société.
                  </p>
                </div>
                <div className="intro-column intro-column-secondary">
                  <p>
                    Cette revue embrasse nos multiplicités et questionne les techniques
                    contemporaines afin de se faire vectrice de {" "}
                    <span className="intro-highlight">suggestion</span>, de {" "}
                    <span className="intro-highlight">mouvement</span>, de {" "}
                    <span className="intro-highlight">critique</span> et de {" "}
                    <span className="intro-highlight">pensée</span>.
                  </p>
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
              </div>
            </section>

            <section className="columns-area">
              <div className="columns">
                <section className="column column-featured">
                  <header className="column-header">
                    <h2>À LA UNE</h2>
                  </header>
                  <div className="column-content">
                    {featuredArticles.map((article) => (
                      <RedesignArticlePreviewCard
                        key={article.slug}
                        article={article}
                        variant={getVariant(article)}
                        ctaLabel="Lire"
                        ctaBackground="#c1c1f4"
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </section>

                <section className="column column-events">
                  <header className="column-header">
                    <h2>
                      <Link href="/IRL">IN REAL LIFE</Link>
                    </h2>
                  </header>
                  <div className="column-content">
                    {irlArticles.map((article) => (
                      <RedesignArticlePreviewCard
                        key={article.slug}
                        article={article}
                        variant="irl"
                        ctaLabel="découvrir"
                        ctaBackground="#f4f0a7"
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </section>
              </div>
            </section>
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
        .main-sections {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 40px;
          background: #e4e4e4;
          min-width: 0;
        }
        .intro {
          padding: 32px clamp(24px, 6vw, 72px) 0;
          max-width: 1320px;
          margin: 0 auto;
          width: min(100%, 1320px);
          box-sizing: border-box;
        }
        .intro-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: clamp(24px, 4vw, 38px);
          align-items: start;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }
        .intro-column {
          font-family: "EnbyGertrude", sans-serif;
          color: #211f18;
          line-height: 1.46;
          font-size: clamp(14px, 1.4vw, 15.5px);
          padding: 0 clamp(6px, 1vw, 16px);
          min-width: 0;
          max-width: 100%;
          word-break: break-word;
          overflow-wrap: anywhere;
          hyphens: auto;
        }
        .intro-column p {
          margin: 0;
        }
        .intro-column p + p {
          margin-top: 14px;
        }
        .intro-column em {
          font-style: italic;
        }
        .intro-column strong {
          font-family: "GayaRegular", serif;
          letter-spacing: 0.02em;
          font-weight: 600;
        }
        .intro-highlight {
          font-family: "GayaRegular", serif;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .intro-highlight em,
        .intro-column em.intro-highlight {
          font-style: italic;
        }
        .intro-actions {
          display: flex;
          gap: 14px;
          margin: 16px 0 0;
          flex-wrap: wrap;
          align-items: center;
        }
        .intro-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          color: #0f0f0f;
          cursor: pointer;
          border-radius: 999px;
          border: 1px solid transparent;
          padding: 8px 16px;
          font-family: "EnbyGertrude", sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
          line-height: 1.1;
          background: var(--intro-action-bg, #c1c1f0);
          box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          transition: background-color 0.2s ease, color 0.2s ease,
            box-shadow 0.2s ease, transform 0.2s ease;
          position: relative;
          isolation: isolate;
        }
        .intro-action:visited {
          color: inherit;
        }
        .intro-action:focus-visible {
          outline: none;
        }
        .intro-action-icon {
          width: 18px;
          height: 18px;
          display: inline-block;
          object-fit: contain;
          flex-shrink: 0;
        }
        .intro-action[data-variant="featured"] {
          --intro-action-bg: #c1c1f0;
          --intro-action-hover: #c7b5f4;
          --intro-action-color: #0f0f0f;
        }
        .intro-action[data-variant="event"] {
          --intro-action-bg: #03b262;
          --intro-action-hover: #2ad07f;
          --intro-action-color: #0f0f0f;
        }
        .intro-action:hover,
        .intro-action:focus-visible,
        .intro-action:active {
          background: var(--intro-action-hover, #c7b5f4);
          color: var(--intro-action-color, #0f0f0f);
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.18);
          transform: translateY(-1px);
        }
        .intro-action:focus-visible {
          outline: 2px solid rgba(17, 17, 17, 0.45);
          outline-offset: 2px;
        }
        .intro-action-label {
          white-space: nowrap;
        }
        .columns-area {
          display: block;
          padding: 0;
        }
        .columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0;
          min-width: 0;
        }
        .column {
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .column-featured {
          background: #d8d8d8;
          color: #111111;
        }
        .column-featured .column-header {
          color: #111111;
        }
        .column-events {
          background: #f2f2f2;
          color: #111111;
        }
        .column-events .column-header {
          color: #111111;
        }
        .column-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 16px;
          font-family: "GayaRegular", serif;
          letter-spacing: 0.01em;
          color: #2b2720;
          padding: 32px 32px 0;
          margin-bottom: 16px;
        }
        .column-header h2 {
          margin: 0;
          font-size: 24px;
          text-transform: uppercase;
        }
        .column-content {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-height: clamp(720px, 82vh, 1180px);
        }
        .column-featured :global(.article-preview),
        .column-events :global(.article-preview) {
          color: #111111;
          margin: 0 32px;
        }
        .column-featured :global(.article-preview:last-child),
        .column-events :global(.article-preview:last-child) {
          margin-bottom: 32px;
        }
        @media (max-width: 960px) {
          .intro {
            padding: 40px 36px 0;
          }
          .column-header {
            padding: 28px 28px 0;
          }
          .column-featured :global(.article-preview),
          .column-events :global(.article-preview) {
            margin: 0 28px;
          }
          .column-featured :global(.article-preview:last-child),
          .column-events :global(.article-preview:last-child) {
            margin-bottom: 28px;
          }
        }
        @media (max-width: 700px) {
          .content {
            flex-direction: column;
            gap: 0;
            padding: 0;
          }
          .intro {
            padding: 32px 20px 0;
            gap: 20px;
            max-width: 520px;
          }
          .intro-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .intro-column {
            padding: 0;
          }
          .intro-actions {
            justify-content: flex-start;
            gap: 12px;
            margin-top: 10px;
          }
          .columns {
            grid-template-columns: 1fr;
          }
          .column-header {
            padding: 28px 24px 0;
          }
          .column-featured :global(.article-preview),
          .column-events :global(.article-preview) {
            margin: 0 24px;
          }
          .column-featured :global(.article-preview:last-child),
          .column-events :global(.article-preview:last-child) {
            margin-bottom: 24px;
          }
          .column-content {
            max-height: none;
          }
        }
        `}</style>
      <style jsx global>{`
        .page-wrapper a {
          color: inherit;
          text-decoration: none;
        }
        .page-wrapper a:visited {
          color: inherit;
        }
        .page-wrapper .footer {
          margin-top: 0;
        }
      `}</style>
    </>
  );
};

export async function getServerSideProps() {
  const records = await getArticleRecords();

  const articles: ArticleWithBody[] = await Promise.all(
    records.map(async (record) => {
      const hydrated =
        (await findArticleRecord(
          record.article.categorySlug || record.article.category,
          record.article.slug
        )) || record;

      const publicPath = hydrated.publicBasePath || record.publicBasePath || "";

      return {
        ...hydrated.article,
        body: hydrated.body,
        bodyHtml: hydrated.bodyHtml,
        bodyMarkdown: hydrated.body,
        content: hydrated.body,
        publicBasePath: publicPath,
        public_path: publicPath,
      };
    })
  );

  return { props: { articles } };
}

export default RedesignPage;
