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
    <div className={`search-drawer-wrapper ${drawerOpen ? "open" : ""}`}>
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
        .search-drawer-wrapper {
          --drawer-collapsed-width: 72px;
          --drawer-collapsed-height: 176px;
          --drawer-offset: calc(var(--sticky-header-height, 96px) + 16px);
          position: relative;
          display: flex;
          flex: 0 0 auto;
          align-self: stretch;
          width: var(--drawer-collapsed-width);
          transition: width 0.3s ease;
        }
        .search-drawer-wrapper::before {
          content: "";
          position: absolute;
          inset: 0;
          background: #efdae0;
          border-right: 1px solid #c3aeb6;
          pointer-events: none;
          z-index: 0;
        }
        .search-drawer-wrapper.open {
          width: 320px;
        }
        .search-drawer {
          position: sticky;
          top: var(--drawer-offset);
          flex: 0 0 auto;
          width: 100%;
          align-self: flex-start;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: fit-content;
          max-height: max(360px, calc(100vh - (var(--drawer-offset) + 32px)));
          box-sizing: border-box;
          z-index: 1;
        }
        .search-drawer.open {
          overflow-y: auto;
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
          .search-drawer-wrapper {
            width: 100%;
            align-self: stretch;
          }
          .search-drawer-wrapper::before {
            display: none;
          }
          .search-drawer {
            position: static;
            top: auto;
            max-height: none;
            height: auto;
            align-self: stretch;
            box-shadow: none;
            clip-path: none;
          }
        }
        @media (max-width: 700px) {
          .search-drawer-wrapper,
          .search-drawer {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #c3aeb6;
            flex-direction: row;
            overflow: hidden;
            max-height: 72px;
          }
          .search-drawer-wrapper.open,
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
    </div>
  );
};

export default RedesignSearchSidebar;
