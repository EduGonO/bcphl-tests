import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const [introHeight, setIntroHeight] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<"about" | "follow" | null>(
    null
  );
  const introCopyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const measure = () => {
      if (typeof window === "undefined") {
        return;
      }

      if (window.innerWidth <= 700) {
        setIntroHeight((previous) => (previous === null ? previous : null));
        return;
      }

      const textNode = introCopyRef.current;
      if (!textNode) {
        return;
      }

      const { height } = textNode.getBoundingClientRect();
      setIntroHeight((previous) => {
        if (previous === null) {
          return height;
        }
        return Math.abs(previous - height) > 0.5 ? height : previous;
      });
    };

    measure();

    const textNode = introCopyRef.current;
    if (!textNode) {
      return;
    }

    let observer: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(textNode);
    }

    window.addEventListener("resize", measure);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener("resize", measure);
    };
  }, []);

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

  const handleHoverStart = (action: "about" | "follow") => {
    setHoveredAction(action);
  };

  const handleHoverEnd = (action: "about" | "follow") => {
    setHoveredAction((current) => (current === action ? null : current));
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
              <div className="intro-copy" ref={introCopyRef}>
                <div className="intro-text">
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
                  <p>
                    Cette revue embrasse nos multiplicités et questionne les techniques
                    contemporaines afin de se faire vectrice de {" "}
                    <span className="intro-highlight">suggestion</span>, de {" "}
                    <span className="intro-highlight">mouvement</span>, de {" "}
                    <span className="intro-highlight">critique</span> et de {" "}
                    <span className="intro-highlight">pensée</span>.
                  </p>
                </div>
                <div className="intro-actions">
                  <Link
                    href={newsletterHref}
                    className={`intro-action ${
                      hoveredAction === "about" ? "is-hovered" : ""
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerEnter={() => handleHoverStart("about")}
                    onPointerMove={() => handleHoverStart("about")}
                    onMouseEnter={() => handleHoverStart("about")}
                    onPointerLeave={() => handleHoverEnd("about")}
                    onMouseLeave={() => handleHoverEnd("about")}
                  >
                    <span className="intro-action-pill featured">S'abonner</span>
                  </Link>
                  <Link
                    href="https://www.instagram.com/revue.bicephale?igsh=MTlhbmgxMXdhdDZybQ=="
                    className={`intro-action ${
                      hoveredAction === "follow" ? "is-hovered" : ""
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onPointerEnter={() => handleHoverStart("follow")}
                    onPointerMove={() => handleHoverStart("follow")}
                    onMouseEnter={() => handleHoverStart("follow")}
                    onPointerLeave={() => handleHoverEnd("follow")}
                    onMouseLeave={() => handleHoverEnd("follow")}
                  >
                    <span className="intro-action-pill event">
                      <img
                        src="/social/instagram.png"
                        alt=""
                        className="intro-action-icon"
                        aria-hidden="true"
                      />
                      Nous suivre
                    </span>
                  </Link>
                </div>
              </div>
              <div
                className="intro-visual"
                style={
                  introHeight !== null
                    ? { height: Math.min(introHeight, 360) }
                    : undefined
                }
              >
                {/*
                <img
                  src="/media/home_image.jpeg"
                  alt="Illustration de la revue Bicéphale"
                />
                */}
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
        }
        .intro {
          display: grid;
          grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr);
          grid-template-areas: "copy visual";
          gap: clamp(20px, 5vw, 44px);
          align-items: flex-start;
          justify-items: stretch;
          padding: 32px clamp(24px, 7vw, 88px) 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        .intro-copy {
          grid-area: copy;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 560px;
          margin: 0 auto;
          width: 100%;
          padding: 0 8px;
        }
        .intro-text {
          font-family: "EnbyGertrude", sans-serif;
          color: #211f18;
          line-height: 1.48;
          font-size: 16px;
        }
        .intro-text p {
          margin: 0 0 12px;
        }
        .intro-text em {
          font-style: italic;
        }
        .intro-text strong {
          font-family: "GayaRegular", serif;
          letter-spacing: 0.02em;
          font-weight: 600;
        }
        .intro-text .intro-highlight {
          font-family: "GayaRegular", serif;
          font-weight: 600;
          letter-spacing: 0.02em;
        }
        .intro-text em.intro-highlight {
          font-style: italic;
        }
        .intro-actions {
          display: flex;
          gap: 18px;
          margin: 4px 0 0;
        }
        .intro-action {
          position: relative;
          display: inline-flex;
          text-decoration: none;
          color: #111111;
          cursor: pointer;
        }
        .intro-action::after {
          content: "";
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: -2px;
          height: 2px;
          border-radius: 999px;
          background: rgba(17, 17, 17, 0.45);
          opacity: 0;
          transform: scaleX(0.5);
          transform-origin: center;
          transition: transform 0.18s ease, opacity 0.18s ease;
          pointer-events: none;
        }
        .intro-action:hover::after,
        .intro-action:focus-visible::after,
        .intro-action:active::after,
        .intro-action.is-hovered::after {
          opacity: 1;
          transform: scaleX(1);
        }
        .intro-action:visited {
          color: inherit;
        }
        .intro-action-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          align-self: flex-start;
          font-family: "EnbyGertrude", sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
          padding: 6px 16px;
          border-radius: 999px;
          line-height: 1.1;
          min-height: 30px;
          transition: transform 0.2s ease, background-color 0.2s ease,
            color 0.2s ease, box-shadow 0.2s ease;
          color: #111111;
          cursor: pointer;
          box-shadow: 0 0 0 rgba(0, 0, 0, 0);
        }
        .intro-action-icon {
          width: 18px;
          height: 18px;
          margin-right: 8px;
          display: inline-block;
          object-fit: contain;
        }
        .intro-action-pill.featured {
          background: #c1c1f0;
        }
        .intro-action-pill.event {
          background: #03b262;
          color: #111111;
        }
        .intro-action:hover .intro-action-pill,
        .intro-action:focus-visible .intro-action-pill,
        .intro-action:active .intro-action-pill,
        .intro-action.is-hovered .intro-action-pill {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.22);
        }
        .intro-action:hover .intro-action-pill.featured,
        .intro-action:focus-visible .intro-action-pill.featured,
        .intro-action:active .intro-action-pill.featured,
        .intro-action.is-hovered .intro-action-pill.featured {
          background: #b2b2ec;
        }
        .intro-action:hover .intro-action-pill.event,
        .intro-action:focus-visible .intro-action-pill.event,
        .intro-action:active .intro-action-pill.event,
        .intro-action.is-hovered .intro-action-pill.event {
          background: #029c58;
          color: #111111;
        }
        .intro-action:focus-visible .intro-action-pill {
          outline: 2px solid rgba(17, 17, 17, 0.4);
          outline-offset: 2px;
        }
        .intro-visual {
          position: relative;
          grid-area: visual;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          width: 100%;
          max-width: 520px;
        }
        .intro-visual img {
          height: 100%;
          width: auto;
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          flex: 0 1 auto;
          display: block;
        }
        .columns-area {
          display: block;
          padding: 0;
        }
        .columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0;
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
          text-transform: lowercase;
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
            grid-template-columns: 1fr;
            grid-template-areas:
              "text"
              "visual"
              "actions";
            padding: 32px 20px 0;
            gap: 16px;
            max-width: 480px;
            justify-items: center;
          }
          .intro-copy {
            display: contents;
            max-width: 100%;
            padding: 0;
            margin: 0;
          }
          .intro-text {
            grid-area: text;
            max-width: 100%;
            text-align: left;
          }
          .intro-visual {
            grid-area: visual;
            max-width: min(68vw, 260px);
            align-items: center;
            justify-content: center;
          }
          .intro-visual img {
            width: 100%;
            height: auto;
            max-height: 220px;
          }
          .intro-actions {
            grid-area: actions;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            margin: 0;
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
