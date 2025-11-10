"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Article } from "../../types";

interface RedesignSearchSidebarProps {
  query: string;
  onQueryChange: (value: string) => void;
  searchLabel?: string;
  placeholder?: string;
  clearLabel?: string;
  newsletterHref?: string;
  newsletterCta?: string;
  articles?: Article[];
  resultLimit?: number;
}

const RedesignSearchSidebar = ({
  query,
  onQueryChange,
  searchLabel = "Recherchez un article",
  placeholder = "Titre, auteur, mot-clé...",
  clearLabel = "Effacer",
  newsletterHref =
    "https://sibforms.com/serve/MUIFAGMMncdAyI0pK_vTiYnFqzGrGlrYzpHdjKLcy55QF9VlcZH4fBfK-qOmzJcslEcSzqsgO8T9qqWQhDm6Wivm1cKw7Emj1-aN4wdauAKe9aYW9DOrX1kGVOtzrKtN20MiOwOb_wYEKjIkEcCwmGHzk9FpEE_5XeOXDvgGfdMPgbbyoWykOn9ibDVITO5Ku0NZUfiBDZgP1nFF",
  newsletterCta = "S’inscrire à la newsletter",
  articles = [],
  resultLimit = 6,
}: RedesignSearchSidebarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const queryTokens = useMemo(
    () =>
      normalizedQuery
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean),
    [normalizedQuery]
  );

  const formatResultDate = (value: string) => {
    if (!value || value === "Unknown Date") {
      return "";
    }

    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      try {
        return new Date(parsed).toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        return value;
      }
    }

    return value;
  };

  const { matches: searchResults, total: totalResults } = useMemo(() => {
    if (!articles.length || queryTokens.length === 0) {
      return { matches: [] as Article[], total: 0 };
    }

    const scored = articles
      .map((article) => {
        const haystack = [
          article.title,
          article.author,
          article.category,
          article.preview,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (queryTokens.some((token) => !haystack.includes(token))) {
          return null;
        }

        const title = article.title.toLowerCase();
        const author = (article.author || "").toLowerCase();
        const category = (article.category || "").toLowerCase();

        let score = 0;

        queryTokens.forEach((token) => {
          if (title.startsWith(token)) {
            score += 6;
          } else if (title.includes(token)) {
            score += 4;
          }

          if (author.includes(token)) {
            score += 2;
          }

          if (category.includes(token)) {
            score += 1.5;
          }

          score += 1;
        });

        return { article, score };
      })
      .filter(
        (entry): entry is { article: Article; score: number } => entry !== null
      );

    scored.sort((a, b) => b.score - a.score);

    return {
      matches: scored
        .slice(0, Math.max(resultLimit, 1))
        .map((entry) => entry.article),
      total: scored.length,
    };
  }, [articles, queryTokens, resultLimit]);

  const hasQuery = queryTokens.length > 0;

  const handleToggleOpen = () => {
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
  };

  return (
    <div className={`search-drawer-rail ${drawerOpen ? "open" : ""}`}>
      <aside className={`search-drawer ${drawerOpen ? "open" : ""}`}>
      <div className={`drawer-section ${drawerOpen ? "open" : ""}`}>
        <button
          type="button"
          className="drawer-toggle"
          onClick={handleToggleOpen}
          aria-expanded={drawerOpen}
          aria-controls="search-panel"
          tabIndex={drawerOpen ? -1 : 0}
          aria-hidden={drawerOpen}
        >
          <span className="drawer-toggle-label">Recherche</span>
        </button>
        <div className="drawer-body" id="search-panel" aria-hidden={!drawerOpen}>
          <div className="drawer-header">
            <h3>Recherche</h3>
            <button
              type="button"
              className="drawer-close"
              onClick={handleClose}
              aria-label="Réduire la recherche"
            >
              Fermer
            </button>
          </div>
          <label className="drawer-label" htmlFor="search-input">
            {searchLabel}
          </label>
          <input
            id="search-input"
            className="drawer-input"
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={placeholder}
            tabIndex={drawerOpen ? 0 : -1}
          />
          {query.trim() && (
            <button
              type="button"
              className="clear-button"
              onClick={() => onQueryChange("")}
              tabIndex={drawerOpen ? 0 : -1}
            >
              {clearLabel}
            </button>
          )}
          {hasQuery && (
            <div className="search-results-wrapper">
              <p className="search-results-label" id="search-results-heading">
                {totalResults > 0
                  ? `Résultats (${totalResults})`
                  : "Aucun résultat"}
              </p>
              {searchResults.length > 0 ? (
                <ul
                  className="search-results"
                  role="list"
                  aria-labelledby="search-results-heading"
                >
                  {searchResults.map((article) => {
                    const linkHref = `/${article.category}/${article.slug}`;
                    const formattedDate = formatResultDate(article.date);
                    const showDate = Boolean(formattedDate);
                    const showAuthor = Boolean(article.author);
                    const showCategory = Boolean(article.category);

                    return (
                      <li
                        key={`${article.category}-${article.slug}`}
                        className="search-result-item"
                      >
                        <Link
                          href={linkHref}
                          className="search-result-link"
                          onClick={handleClose}
                        >
                          <span className="search-result-title">
                            {article.title}
                          </span>
                          <span className="search-result-meta">
                            {showAuthor && (
                              <span className="search-result-author">
                                {article.author}
                              </span>
                            )}
                            {showAuthor && showDate && (
                              <span
                                className="search-result-separator"
                                aria-hidden="true"
                              >
                                ·
                              </span>
                            )}
                            {showDate && (
                              <time
                                className="search-result-date"
                                dateTime={article.date}
                              >
                                {formattedDate}
                              </time>
                            )}
                            {(showAuthor || showDate) && showCategory && (
                              <span
                                className="search-result-separator"
                                aria-hidden="true"
                              >
                                ·
                              </span>
                            )}
                            {showCategory && (
                              <span className="search-result-category">
                                {article.category}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="search-no-results">
                  Aucun article ne correspond à votre recherche pour le moment.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={`drawer-section ${drawerOpen ? "open" : ""}`}>
        <button
          type="button"
          className="drawer-toggle"
          onClick={handleToggleOpen}
          aria-expanded={drawerOpen}
          aria-controls="newsletter-panel"
          tabIndex={drawerOpen ? -1 : 0}
          aria-hidden={drawerOpen}
        >
          <span className="drawer-toggle-label">Newsletter</span>
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
              onClick={handleClose}
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
            href={newsletterHref}
            className="drawer-newsletter-button"
            tabIndex={drawerOpen ? 0 : -1}
          >
            {newsletterCta}
          </Link>
        </div>
      </div>
      </aside>

      <style jsx>{`
        .search-drawer-rail {
          position: relative;
          z-index: 1;
          display: flex;
          flex: 0 0 auto;
          align-items: stretch;
          align-self: stretch;
          background: #efdae0;
          border-right: 1px solid #c3aeb6;
        }
        .search-drawer-rail.open {
          z-index: 2;
        }
        .search-drawer {
          --drawer-collapsed-width: 72px;
          --drawer-collapsed-height: 176px;
          --drawer-offset: calc(var(--sticky-header-height, 96px) + 16px);
          --drawer-height: calc(100vh - var(--drawer-offset));
          position: sticky;
          top: var(--drawer-offset);
          flex: 0 0 auto;
          width: var(--drawer-collapsed-width);
          background: #efdae0;
          display: flex;
          flex-direction: column;
          overflow: visible;
          box-sizing: border-box;
          min-height: var(--drawer-height);
          height: max(var(--drawer-height), 100%);
          max-height: none;
          padding-bottom: 24px;
          transition: width 0.3s ease;
          z-index: 1;
        }
        .search-drawer.open {
          width: 320px;
          min-height: var(--drawer-height);
          height: auto;
        }
        .drawer-section {
          position: relative;
          display: grid;
          grid-template-rows: minmax(0, 1fr);
          align-content: start;
          overflow: hidden;
          background: #efdae0;
          min-height: var(--drawer-collapsed-height);
        }
        .drawer-section.open {
          background: #f5e7ea;
          min-height: auto;
        }
        .drawer-section + .drawer-section {
          border-top: 1px solid rgba(17, 17, 17, 0.18);
          margin-top: -1px;
        }
        .drawer-toggle {
          position: relative;
          z-index: 2;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(17, 17, 17, 0.18);
          cursor: pointer;
          text-transform: uppercase;
          font-family: "InterMedium", sans-serif;
          font-size: 15px;
          letter-spacing: 0.08em;
          color: #0d0d0d;
          transition: opacity 0.3s ease, transform 0.3s ease;
          grid-area: 1 / 1;
          align-self: start;
          justify-self: stretch;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: var(--drawer-collapsed-height);
          width: 100%;
          min-width: 0;
          padding: 0;
        }
        .drawer-toggle-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-90deg);
          transform-origin: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          letter-spacing: 0.08em;
          white-space: nowrap;
          width: var(--drawer-collapsed-width);
          text-align: center;
          padding: 4px 0;
        }
        .drawer-section.open .drawer-toggle {
          opacity: 0;
          transform: translateX(-12px);
          pointer-events: none;
        }
        .drawer-body {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: #f5e7ea;
          border-top: 1px solid rgba(17, 17, 17, 0.16);
          opacity: 0;
          transform: translateX(-24px);
          transition: opacity 0.3s ease, transform 0.3s ease, max-height 0.3s ease,
            padding 0.3s ease;
          pointer-events: none;
          grid-area: 1 / 1;
          align-self: start;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
          max-height: 0;
          padding: 0 26px;
          overflow: hidden;
          visibility: hidden;
        }
        .drawer-section.open .drawer-body {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
          max-height: 1000px;
          padding: 28px 26px 32px;
          visibility: visible;
        }
        .drawer-body-newsletter {
          gap: 24px;
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
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
        .search-results-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .search-results-label {
          margin: 0;
          font-size: 13px;
          font-family: "InterMedium", sans-serif;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(44, 28, 35, 0.72);
        }
        .search-results {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
          max-height: 240px;
          overflow-y: auto;
          scrollbar-width: thin;
        }
        .search-results::-webkit-scrollbar {
          width: 6px;
        }
        .search-results::-webkit-scrollbar-track {
          background: rgba(255, 247, 250, 0.4);
          border-radius: 999px;
        }
        .search-results::-webkit-scrollbar-thumb {
          background: rgba(44, 28, 35, 0.35);
          border-radius: 999px;
        }
        .search-result-item {
          margin: 0;
        }
        .search-result-link {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 14px;
          border: 1px solid rgba(44, 28, 35, 0.14);
          border-radius: 14px;
          background: rgba(255, 247, 250, 0.92);
          text-decoration: none;
          transition: border-color 0.2s ease, transform 0.2s ease,
            box-shadow 0.2s ease;
        }
        .search-result-link:hover,
        .search-result-link:focus-visible {
          border-color: rgba(44, 28, 35, 0.36);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(44, 28, 35, 0.16);
        }
        .search-result-title {
          font-family: "GayaRegular", serif;
          font-size: 16px;
          line-height: 1.32;
          color: #2c1c23;
        }
        .search-result-meta {
          display: inline-flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          font-family: "InterRegular", sans-serif;
          font-size: 12px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(44, 28, 35, 0.72);
        }
        .search-result-author {
          font-family: "InterMedium", sans-serif;
        }
        .search-result-date {
          font-style: normal;
        }
        .search-result-category {
          font-family: "InterMedium", sans-serif;
          letter-spacing: 0.08em;
        }
        .search-result-separator {
          color: rgba(44, 28, 35, 0.38);
        }
        .search-no-results {
          margin: 0;
          font-family: "InterRegular", sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: rgba(44, 28, 35, 0.68);
        }
        .drawer-text {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          font-family: "InterRegular", sans-serif;
          color: #3c2b31;
          word-break: break-word;
          hyphens: auto;
        }
        .drawer-newsletter-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 247, 250, 0.92);
          color: #2c1c23;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: "InterMedium", sans-serif;
          font-size: 13px;
          padding: 12px 26px;
          border: 1px solid rgba(44, 28, 35, 0.6);
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease,
            box-shadow 0.2s ease, border-color 0.2s ease;
          text-decoration: none;
          align-self: flex-start;
          box-shadow: 0 8px 24px rgba(44, 28, 35, 0.12);
        }
        .drawer-newsletter-button:hover,
        .drawer-newsletter-button:focus-visible {
          background: #2c1c23;
          color: #fff7fa;
          border-color: #2c1c23;
          box-shadow: 0 10px 28px rgba(44, 28, 35, 0.24);
        }
        @media (max-width: 960px) {
          .search-drawer-rail {
            background: transparent;
            border-right: none;
          }
          .search-drawer {
            position: static;
            top: auto;
            max-height: none;
            min-height: auto;
            height: auto;
            align-self: stretch;
            padding-bottom: 0;
          }
        }
        @media (max-width: 700px) {
          .search-drawer-rail {
            width: 100%;
          }
          .search-drawer {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #c3aeb6;
            flex-direction: row;
            overflow: hidden;
            max-height: 72px;
          }
          .search-drawer.open {
            width: 100%;
            max-height: none;
            flex-direction: column;
          }
          .drawer-section {
            width: 50%;
            min-height: auto;
          }
          .search-drawer.open .drawer-section {
            width: 100%;
          }
          .drawer-toggle {
            min-height: 72px;
          }
          .drawer-toggle-label {
            width: 100%;
            transform: translate(-50%, -50%);
            padding: 0;
          }
          .search-drawer.open .drawer-body {
            padding: 24px 20px 28px;
          }
          .drawer-text {
            font-size: 15px;
          }
          .drawer-newsletter-button {
            width: 100%;
            justify-content: center;
            font-size: 13px;
          }
          .search-results {
            max-height: 200px;
          }
          .search-drawer:not(.open) .drawer-section + .drawer-section {
            border-top: none;
            margin-top: 0;
            border-left: 1px solid rgba(17, 17, 17, 0.18);
          }
          .search-drawer.open .drawer-section + .drawer-section {
            border-top: 1px solid rgba(17, 17, 17, 0.18);
            margin-top: -1px;
          }
        }
      `}</style>
    </div>
  );
};

export default RedesignSearchSidebar;
