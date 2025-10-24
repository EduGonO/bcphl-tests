import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";

import { NAV_LINKS } from "../../config/navLinks";
import { Article } from "../../types";
import Footer from "./Footer";
import RedesignArticlePreviewCard from "./RedesignArticlePreviewCard";

interface CategoryLandingPageProps {
  articles: Article[];
  introContent: ReactNode;
  columnTitle: string;
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
}: CategoryLandingPageProps) => {
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      <header className="top-nav">
        <div className="brand">
          <img src="/media/logo.png" alt="Bicéphale" className="brand-logo" />
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
        <aside className={`search-drawer ${drawerOpen ? "open" : ""}`}>
          <div className={`drawer-section ${drawerOpen ? "open" : ""}`}>
            <button
              type="button"
              className="drawer-toggle"
              onClick={() => {
                setDrawerOpen(true);
              }}
              aria-expanded={drawerOpen}
              aria-controls="search-panel"
              tabIndex={drawerOpen ? -1 : 0}
              aria-hidden={drawerOpen}
            >
              <span>Recherche</span>
            </button>
            <div
              className="drawer-body"
              id="search-panel"
              aria-hidden={!drawerOpen}
            >
              <div className="drawer-header">
                <h3>Recherche</h3>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Réduire la recherche"
                >
                  Fermer
                </button>
              </div>
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
                tabIndex={drawerOpen ? 0 : -1}
              />
              {normalizedQuery && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={() => setQuery("")}
                  tabIndex={drawerOpen ? 0 : -1}
                >
                  Effacer
                </button>
              )}
            </div>
          </div>
          <div className={`drawer-section ${drawerOpen ? "open" : ""}`}>
            <button
              type="button"
              className="drawer-toggle"
              onClick={() => {
                setDrawerOpen(true);
              }}
              aria-expanded={drawerOpen}
              aria-controls="newsletter-panel"
              tabIndex={drawerOpen ? -1 : 0}
              aria-hidden={drawerOpen}
            >
              <span>Newsletter</span>
            </button>
            <div
              className="drawer-body drawer-body-newsletter"
              id="newsletter-panel"
              aria-hidden={!drawerOpen}
            >
              <div className="drawer-header">
                <h3>Newsletter</h3>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Réduire la newsletter"
                >
                  Fermer
                </button>
              </div>
              <p className="drawer-text">
                Recevez nos dernières publications et événements directement dans
                votre boîte mail.
              </p>
              <Link
                href="/newsletter"
                className="drawer-newsletter-button"
                tabIndex={drawerOpen ? 0 : -1}
              >
                S&rsquo;inscrire à la newsletter
              </Link>
            </div>
          </div>
        </aside>

        <div className="main-sections">
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
                    variant="featured"
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
        .search-drawer {
          position: relative;
          flex: 0 0 auto;
          width: 72px;
          align-self: stretch;
          background: #efdae0;
          border-right: 1px solid #c3aeb6;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.3s ease, max-height 0.3s ease;
          min-height: 100%;
          box-sizing: border-box;
        }
        .search-drawer.open {
          width: 320px;
        }
        .drawer-section {
          position: relative;
          display: grid;
          grid-template-rows: minmax(0, 1fr);
          align-content: start;
          overflow: hidden;
          background: #efdae0;
        }
        .drawer-section.open {
          background: #f5e7ea;
        }
        .drawer-toggle {
          appearance: none;
          border: none;
          background: none;
          padding: 20px 0;
          font-family: "GayaRegular", serif;
          font-size: 18px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: #2c1c23;
          cursor: pointer;
        }
        .drawer-toggle:hover,
        .drawer-toggle:focus-visible {
          color: #1a0f14;
        }
        .drawer-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 24px;
        }
        .drawer-body-newsletter {
          gap: 14px;
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .drawer-body h3 {
          margin: 0;
          text-transform: uppercase;
          font-family: "GayaRegular", serif;
          letter-spacing: 0.14em;
          font-size: 18px;
          color: #2c1c23;
        }
        .drawer-close {
          background: none;
          border: 1px solid rgba(44, 28, 35, 0.4);
          text-transform: uppercase;
          font-family: "InterMedium", sans-serif;
          letter-spacing: 0.12em;
          font-size: 11px;
          padding: 6px 16px;
          cursor: pointer;
          color: #2c1c23;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .drawer-close:hover,
        .drawer-close:focus-visible {
          background: #2c1c23;
          color: #fff7fa;
        }
        .drawer-label {
          font-size: 14px;
          font-family: "InterRegular", sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #5b3f47;
        }
        .drawer-input {
          background: #fff7fa;
          border: 1px solid #bfa9b2;
          padding: 12px;
          font-size: 16px;
          font-family: "InterRegular", sans-serif;
        }
        .clear-button {
          align-self: flex-start;
          background: #fff7fa;
          border: 1px solid #bfa9b2;
          padding: 6px 18px;
          text-transform: uppercase;
          font-size: 13px;
          font-family: "InterMedium", sans-serif;
          cursor: pointer;
          color: #2c1c23;
        }
        .clear-button:hover,
        .clear-button:focus-visible {
          background: #2c1c23;
          color: #fff7fa;
        }
        .drawer-text {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          font-family: "InterRegular", sans-serif;
          color: #3c2b31;
        }
        .drawer-newsletter-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #2c1c23;
          color: #fff7fa;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: "InterMedium", sans-serif;
          font-size: 12px;
          padding: 12px 24px;
          border: 1px solid #2c1c23;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
          text-decoration: none;
          align-self: flex-start;
        }
        .drawer-newsletter-button:hover,
        .drawer-newsletter-button:focus-visible {
          background: transparent;
          color: #2c1c23;
        }
        .main-sections {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 52px;
          background: #e4e4e4;
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
          padding: 0 clamp(24px, 6vw, 72px) 64px;
          width: 100%;
          box-sizing: border-box;
        }
        .single-column {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: min(960px, 100%);
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
          font-size: 20px;
        }
        .column-count {
          font-size: 14px;
          color: rgba(17, 17, 17, 0.72);
        }
        .column-content {
          display: grid;
          gap: 24px;
        }
        @media (max-width: 960px) {
          .search-drawer {
            position: sticky;
            top: 92px;
          }
        }
        @media (max-width: 700px) {
          .content {
            flex-direction: column;
          }
          .search-drawer {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #c3aeb6;
            flex-direction: row;
            overflow: hidden;
            max-height: 72px;
            transition: max-height 0.3s ease;
          }
          .search-drawer.open {
            width: 100%;
            max-height: 1000px;
          }
          .drawer-section {
            width: 50%;
          }
          .drawer-toggle {
            writing-mode: horizontal-tb;
            transform: none;
          }
          .drawer-body {
            padding: 20px;
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
      `}</style>
    </div>
  );
};

export default CategoryLandingPage;
