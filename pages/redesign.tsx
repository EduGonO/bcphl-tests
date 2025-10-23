import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Footer from "../app/components/Footer";
import { Article } from "../types";
import { getArticleData } from "../lib/articleService";

interface RedesignProps {
  articles: Article[];
}

const NAV_LINKS = [
  { label: "Réflexion", href: "/categories/info" },
  { label: "Création", href: "/categories/image-critique" },
  { label: "IRL", href: "/evenements" },
  { label: "À propos", href: "/bios" },
];

const RedesignPage: React.FC<RedesignProps> = ({ articles }) => {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

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

  const getPrimaryMedia = (article: Article) => {
    if (article.headerImage) return article.headerImage;
    if (article.media && article.media.length > 0) return article.media[0];
    return "";
  };

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
          <section className="intro">
            <div className="intro-text">
              <p>
                Dans la même urgence que la revue <em>Acéphale</em> publiée par Georges
                Bataille en 1936 et portée par un désir de la contribution propre à
                Bernard Stiegler, la revue <strong>BICÉPHALE</strong> conjugue la créativité
                contemporaine à travers des textes inédits lors des soirées bicéphales
                et une démarche réflexive analysant les arts, les techniques et la
                société.
              </p>
              <p>
                Cette revue embrasse nos multiplicités et questionne les techniques
                contemporaines afin de se faire vectrice de suggestion, de mouvement,
                de critique et de pensée.
              </p>
              <div className="intro-actions">
                <Link href="/categories/info" className="primary-action">
                  Lire la revue
                </Link>
                <Link href="/evenements" className="secondary-action">
                  Voir nos événements
                </Link>
              </div>
            </div>
            <div className="intro-visual">
              <div className="visual-card">
                <div className="visual-card-body">
                  <p>
                    « Les techniques que nous aimons sont celles qui nous font sentir
                    plus vivants, plus attentifs à ce qui nous relie. »
                  </p>
                  <span>— Revue Bicéphale</span>
                </div>
                <img
                  src="/media/articles/Automaton/desertion-annie-lebrun.jpeg"
                  alt="Illustration"
                />
              </div>
            </div>
          </section>

          <section className="columns-area">
            <div className={`search-drawer ${searchOpen ? "open" : ""}`}>
              <button
                className="drawer-toggle"
                onClick={() => setSearchOpen((open) => !open)}
                aria-expanded={searchOpen}
                aria-controls="search-panel"
              >
                <span>Recherche</span>
              </button>
              <div className="drawer-body" id="search-panel">
                <h3>Recherche</h3>
                <label className="drawer-label" htmlFor="search-input">
                  Recherchez un article
                </label>
                <input
                  id="search-input"
                  className="drawer-input"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Titre, auteur, mot-clé..."
                />
                {normalizedQuery && (
                  <button
                    className="clear-button"
                    onClick={() => setQuery("")}
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>

            <div className="columns">
              <section className="column">
                <header className="column-header">
                  <h2>à la une</h2>
                  <span className="column-count">{featuredArticles.length}</span>
                </header>
                <div className="column-content">
                  {featuredArticles.map((article) => {
                    const media = getPrimaryMedia(article);
                    return (
                      <article key={article.slug} className="article-card">
                        {media && (
                          <div className="article-media">
                            <img src={media} alt="" loading="lazy" />
                          </div>
                        )}
                        <div className="article-body">
                          <div className="article-meta">
                            <time dateTime={article.date}>{formatDate(article.date)}</time>
                            <span className="article-author">{article.author}</span>
                          </div>
                          <h3>{article.title}</h3>
                          <p>{article.preview}</p>
                          <Link
                            href={`/${article.category}/${article.slug}`}
                            className="article-link"
                          >
                            en lire
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="column">
                <header className="column-header">
                  <h2>nos événements</h2>
                  <span className="column-count">{eventArticles.length}</span>
                </header>
                <div className="column-content">
                  {eventArticles.map((article) => {
                    const media = getPrimaryMedia(article);
                    return (
                      <article key={article.slug} className="article-card event">
                        {media && (
                          <div className="article-media">
                            <img src={media} alt="" loading="lazy" />
                          </div>
                        )}
                        <div className="article-body">
                          <div className="article-meta">
                            <time dateTime={article.date}>{formatDate(article.date)}</time>
                            <span className="article-category">{article.category}</span>
                          </div>
                          <h3>{article.title}</h3>
                          <p>{article.preview}</p>
                          <Link
                            href={`/${article.category}/${article.slug}`}
                            className="article-link highlight"
                          >
                            d’infos
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </section>
        </main>

        <Footer footerColor="#0c0c0c" />
      </div>

      <style jsx>{`
        :global(body) {
          background: #f3f1ed;
        }
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #f3f1ed 0%, #dcd7d0 60%, #f3f1ed 100%);
        }
        .top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 48px 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background: #ffffffb3;
          backdrop-filter: blur(8px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: "RecoletaMedium", "GayaRegular", serif;
          font-size: 20px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .brand-logo {
          width: 38px;
          height: 38px;
          object-fit: contain;
        }
        .brand-name {
          color: #090909;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
          font-family: "InterMedium", sans-serif;
          font-size: 15px;
          text-transform: uppercase;
        }
        .nav-link {
          color: #252525;
          text-decoration: none;
          position: relative;
          padding-bottom: 4px;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 2px;
          background: #4f4bce;
          transition: width 0.2s ease;
        }
        .nav-link:hover::after,
        .nav-link:focus-visible::after {
          width: 100%;
        }
        .content {
          flex: 1;
          padding: 32px 48px 48px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .intro {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          gap: 32px;
          align-items: stretch;
        }
        .intro-text {
          background: rgba(255, 255, 255, 0.9);
          padding: 32px;
          border-radius: 20px;
          box-shadow: 0 18px 36px rgba(15, 15, 15, 0.08);
          font-family: "InterRegular", sans-serif;
          color: #1d1d1d;
          line-height: 1.6;
          font-size: 16px;
        }
        .intro-text p {
          margin: 0 0 16px;
        }
        .intro-text em {
          font-style: italic;
        }
        .intro-text strong {
          font-family: "RecoletaMedium", serif;
          letter-spacing: 0.02em;
        }
        .intro-actions {
          display: flex;
          gap: 16px;
          margin-top: 24px;
        }
        .intro-actions a {
          text-decoration: none;
          font-family: "InterMedium", sans-serif;
          font-size: 15px;
          padding: 10px 22px;
          border-radius: 24px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .primary-action {
          background: #4f4bce;
          color: #fff;
          box-shadow: 0 8px 18px rgba(79, 75, 206, 0.25);
        }
        .secondary-action {
          background: #d1f27d;
          color: #1a1a1a;
          box-shadow: 0 8px 18px rgba(209, 242, 125, 0.4);
        }
        .intro-actions a:hover,
        .intro-actions a:focus-visible {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
        .intro-visual {
          display: flex;
          align-items: stretch;
        }
        .visual-card {
          background: linear-gradient(165deg, #f8f5ef, #d2cec7);
          border-radius: 24px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 24px;
          box-shadow: 0 20px 40px rgba(12, 12, 12, 0.16);
        }
        .visual-card-body {
          font-family: "InterRegular", sans-serif;
          color: #3f3f3f;
          font-size: 16px;
          line-height: 1.6;
        }
        .visual-card-body span {
          display: block;
          margin-top: 12px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .visual-card img {
          width: 100%;
          border-radius: 16px;
          object-fit: cover;
          max-height: 220px;
        }
        .columns-area {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 24px;
          align-items: stretch;
        }
        .search-drawer {
          position: relative;
          width: 64px;
          transition: width 0.3s ease;
          background: rgba(109, 101, 176, 0.12);
          border-radius: 24px;
          overflow: hidden;
          backdrop-filter: blur(6px);
        }
        .search-drawer.open {
          width: 320px;
        }
        .drawer-toggle {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 64px;
          border: none;
          background: linear-gradient(180deg, #f1efff, #d9d5f2);
          color: #3b3670;
          font-family: "InterMedium", sans-serif;
          writing-mode: vertical-rl;
          text-orientation: mixed;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }
        .search-drawer.open .drawer-toggle {
          box-shadow: inset -1px 0 0 rgba(59, 54, 112, 0.25);
        }
        .drawer-toggle:focus-visible {
          outline: 2px solid #4f4bce;
          outline-offset: 4px;
        }
        .drawer-body {
          padding: 24px 24px 24px 88px;
          opacity: 0;
          transform: translateX(-12px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .search-drawer.open .drawer-body {
          opacity: 1;
          transform: translateX(0);
        }
        .drawer-body h3 {
          margin: 0;
          font-family: "RecoletaMedium", serif;
          font-size: 20px;
          color: #332f63;
        }
        .drawer-label {
          font-size: 13px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #5b5596;
        }
        .drawer-input {
          border-radius: 18px;
          border: 1px solid rgba(91, 85, 150, 0.35);
          padding: 10px 16px;
          font-size: 15px;
          font-family: "InterRegular", sans-serif;
          background: rgba(255, 255, 255, 0.85);
        }
        .drawer-input:focus {
          outline: none;
          border-color: #4f4bce;
          box-shadow: 0 0 0 3px rgba(79, 75, 206, 0.18);
        }
        .clear-button {
          align-self: flex-start;
          border: none;
          background: none;
          color: #4f4bce;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          cursor: pointer;
          padding: 0;
        }
        .columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 24px;
        }
        .column {
          background: rgba(255, 255, 255, 0.86);
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 24px 42px rgba(22, 22, 22, 0.14);
          display: flex;
          flex-direction: column;
        }
        .column-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          text-transform: uppercase;
          font-family: "RecoletaMedium", serif;
          letter-spacing: 0.18em;
          color: #1f1f1f;
          margin-bottom: 16px;
        }
        .column-header h2 {
          margin: 0;
          font-size: 20px;
        }
        .column-count {
          font-family: "InterMedium", sans-serif;
          font-size: 14px;
          padding: 4px 10px;
          border-radius: 14px;
          background: rgba(79, 75, 206, 0.12);
          color: #3b3670;
        }
        .column-content {
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-height: clamp(420px, 60vh, 640px);
          padding-right: 8px;
        }
        .article-card {
          background: linear-gradient(160deg, #f7f7f7, #e2dfd9);
          border-radius: 20px;
          padding: 18px;
          display: grid;
          grid-template-columns: 120px minmax(0, 1fr);
          gap: 16px;
          font-family: "InterRegular", sans-serif;
          color: #1f1f1f;
        }
        .article-card.event {
          background: linear-gradient(160deg, #f7f7f7, #f0f7e1);
        }
        .article-media img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 16px;
        }
        .article-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .article-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #5a5a5a;
        }
        .article-body h3 {
          margin: 0;
          font-size: 18px;
          font-family: "RecoletaMedium", serif;
          color: #232323;
        }
        .article-body p {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
        }
        .article-link {
          margin-top: auto;
          align-self: flex-start;
          text-decoration: none;
          font-family: "InterMedium", sans-serif;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #4f4bce;
        }
        .article-link.highlight {
          color: #1a7a45;
        }
        .article-link:hover,
        .article-link:focus-visible {
          text-decoration: underline;
        }
        @media (max-width: 1200px) {
          .content {
            padding: 32px;
          }
          .intro {
            grid-template-columns: 1fr;
          }
          .intro-visual {
            order: -1;
          }
        }
        @media (max-width: 1024px) {
          .columns-area {
            grid-template-columns: 1fr;
          }
          .search-drawer {
            order: -1;
            width: 100%;
            height: auto;
            display: flex;
            align-items: center;
          }
          .search-drawer.open {
            width: 100%;
          }
          .drawer-toggle {
            position: static;
            width: 56px;
            height: 56px;
            border-radius: 18px;
            writing-mode: horizontal-tb;
            padding: 0 16px;
          }
          .drawer-body {
            padding: 16px 24px;
            transform: translateY(-8px);
          }
          .search-drawer.open .drawer-body {
            transform: translateY(0);
          }
          .columns {
            grid-template-columns: 1fr;
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
          .content {
            padding: 24px 20px 40px;
          }
          .intro-text {
            padding: 24px;
          }
          .visual-card {
            padding: 24px;
          }
          .article-card {
            grid-template-columns: 1fr;
          }
          .article-media img {
            height: 180px;
          }
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
