import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Footer from "../app/components/Footer";
import RedesignArticlePreviewCard from "../app/components/RedesignArticlePreviewCard";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
import { NAV_LINKS } from "../config/navLinks";
import { Article } from "../types";
import { getArticleData } from "../lib/articleService";

interface RedesignProps {
  articles: Article[];
}

const RedesignPage: React.FC<RedesignProps> = ({ articles }) => {
  const [query, setQuery] = useState("");
  const [introHeight, setIntroHeight] = useState<number | null>(null);
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

  const matchesQuery = (article: Article) => {
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

  const featuredArticles = useMemo(
    () => sortedArticles.filter(matchesQuery),
    [sortedArticles, normalizedQuery]
  );

  const eventArticles = useMemo(
    () =>
      sortedArticles
        .filter((article) => article.category === "Automaton")
        .filter(matchesQuery),
    [sortedArticles, normalizedQuery]
  );

  return (
    <>
      <Head>
        <title>Bicéphale · Nouvelle page</title>
      </Head>
      <div className="page-wrapper">
        <header className="top-nav">
          <div className="brand">
            <img
              src="/media/logo.png"
              alt="Bicéphale"
              className="brand-logo"
            />
            <span className="brand-name">Bicéphale</span>
          </div>
          <nav className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="content">
          <RedesignSearchSidebar query={query} onQueryChange={setQuery} />

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
                  <Link href="/categories/info" className="intro-action">
                    <span className="intro-action-pill featured">manifeste</span>
                  </Link>
                  <Link href="/evenements" className="intro-action">
                    <span className="intro-action-pill event">nous suivre</span>
                  </Link>
                </div>
              </div>
              <div
                className="intro-visual"
                style={
                  introHeight !== null
                    ? { height: Math.min(introHeight, 420) }
                    : undefined
                }
              >
                <img
                  src="/media/home_image.jpeg"
                  alt="Illustration de la revue Bicéphale"
                />
              </div>
            </section>

            <section className="columns-area">
              <div className="columns">
                <section className="column column-featured">
                  <header className="column-header">
                    <h2>à la une</h2>
                    <span className="column-count">{featuredArticles.length}</span>
                  </header>
                  <div className="column-content">
                    {featuredArticles.map((article) => (
                      <RedesignArticlePreviewCard
                        key={article.slug}
                        article={article}
                        variant="featured"
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </section>

                <section className="column column-events">
                  <header className="column-header">
                    <h2>nos événements</h2>
                    <span className="column-count">{eventArticles.length}</span>
                  </header>
                  <div className="column-content">
                    {eventArticles.map((article) => (
                      <RedesignArticlePreviewCard
                        key={article.slug}
                        article={article}
                        variant="event"
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
        .top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 26px 48px 18px;
          border-bottom: 1px solid #b9b0a3;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .brand-logo {
          width: 46px;
          height: 46px;
          object-fit: contain;
        }
        .brand-name {
          color: #0d0d0d;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
          font-family: "InterMedium", sans-serif;
          font-size: 16px;
          text-transform: uppercase;
        }
        .nav-link {
          color: #111;
          text-decoration: none;
        }
        .nav-link:visited {
          color: #111;
        }
        .nav-link:hover,
        .nav-link:focus-visible {
          color: #3a3a3a;
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
        .intro {
          display: grid;
          grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr);
          grid-template-areas: "copy visual";
          gap: clamp(28px, 6vw, 64px);
          align-items: flex-start;
          justify-items: stretch;
          padding: 48px clamp(24px, 7vw, 88px) 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        .intro-copy {
          grid-area: copy;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 560px;
          margin: 0 auto;
          width: 100%;
          padding: 0 8px;
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
          margin: 8px 0 0;
        }
        .intro-action {
          display: inline-flex;
          text-decoration: none;
          color: #111111;
        }
        .intro-action:visited {
          color: inherit;
        }
        .intro-action-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          align-self: flex-start;
          font-family: "InterRegular", sans-serif;
          font-size: 14px;
          letter-spacing: 0.05em;
          padding: 6px 16px;
          border-radius: 999px;
          line-height: 1.1;
          min-height: 30px;
          transition: transform 0.2s ease;
          color: #111111;
        }
        .intro-action-pill.featured {
          background: #c1c1f0;
        }
        .intro-action-pill.event {
          background: #f4f0ae;
        }
        .intro-action:hover .intro-action-pill,
        .intro-action:focus-visible .intro-action-pill {
          transform: translateY(-1px);
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
        .column-featured .column-count {
          border: 1px solid rgba(17, 17, 17, 0.28);
          background: rgba(255, 255, 255, 0.5);
          color: #111111;
        }
        .column-events {
          background: #f2f2f2;
          color: #111111;
        }
        .column-events .column-header {
          color: #111111;
        }
        .column-events .column-count {
          border: 1px solid rgba(17, 17, 17, 0.28);
          background: rgba(255, 255, 255, 0.62);
          color: #111111;
        }
        .column-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          text-transform: uppercase;
          font-family: "GayaRegular", serif;
          letter-spacing: 0.18em;
          color: #2b2720;
          padding: 32px 32px 0;
          margin-bottom: 16px;
        }
        .column-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .column-count {
          font-family: "InterMedium", sans-serif;
          font-size: 13px;
          padding: 4px 12px;
          border-radius: 16px;
          border: 1px solid rgba(17, 17, 17, 0.36);
          background: rgba(255, 255, 255, 0.6);
        }
        .column-content {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-height: clamp(420px, 60vh, 640px);
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
        @media (max-width: 720px) {
          .top-nav {
            padding: 16px 20px;
            flex-direction: column;
            gap: 12px;
          }
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
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

export async function getStaticProps() {
  const { articles } = getArticleData();
  return { props: { articles } };
}

export default RedesignPage;
