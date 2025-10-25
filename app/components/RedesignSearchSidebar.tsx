"use client";

import Link from "next/link";
import { useState } from "react";

interface RedesignSearchSidebarProps {
  query: string;
  onQueryChange: (value: string) => void;
  searchLabel?: string;
  placeholder?: string;
  clearLabel?: string;
  newsletterHref?: string;
  newsletterCta?: string;
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
}: RedesignSearchSidebarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleOpen = () => {
    setDrawerOpen(true);
  };

  const handleClose = () => {
    setDrawerOpen(false);
  };

  return (
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

      <style jsx>{`
        .search-drawer {
          --drawer-collapsed-width: 72px;
          position: sticky;
          top: 92px;
          flex: 0 0 auto;
          width: var(--drawer-collapsed-width);
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
          min-height: 204px;
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
          padding: 28px 26px 32px;
          background: #f5e7ea;
          border-top: 1px solid rgba(17, 17, 17, 0.16);
          opacity: 0;
          transform: translateX(-24px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
          grid-area: 1 / 1;
          align-self: start;
          box-sizing: border-box;
          width: 100%;
          min-width: 0;
        }
        .drawer-section.open .drawer-body {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }
        .drawer-body-newsletter {
          gap: 20px;
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
          background: linear-gradient(135deg, #2c1c23, #4a2f39);
          color: #fff7fa;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: "InterMedium", sans-serif;
          font-size: 12px;
          padding: 12px 26px;
          border: 1px solid #2c1c23;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
          text-decoration: none;
          align-self: flex-start;
          box-shadow: 0 6px 16px rgba(44, 28, 35, 0.15);
        }
        .drawer-newsletter-button:hover,
        .drawer-newsletter-button:focus-visible {
          background: #fff7fa;
          color: #2c1c23;
          box-shadow: 0 6px 16px rgba(44, 28, 35, 0.22);
        }
        @media (max-width: 960px) {
          .search-drawer {
            position: static;
            top: auto;
          }
        }
        @media (max-width: 700px) {
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
          .drawer-body {
            padding: 24px 20px 28px;
            width: 100%;
            box-sizing: border-box;
          }
          .drawer-text {
            font-size: 15px;
          }
          .drawer-newsletter-button {
            width: 100%;
            justify-content: center;
            font-size: 13px;
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
    </aside>
  );
};

export default RedesignSearchSidebar;
