// /app/components/Header.tsx
import React, { useState } from 'react';
import Link from 'next/link';

export type Category = { name: string; color: string };

export type HeaderProps = {
  categories: Category[];
  onCategoryChange?: (category: string) => void;
};

const Header: React.FC<HeaderProps> = ({ categories, onCategoryChange }) => {
  // Manage the hover state for "Rubriques"
  const [isRubriquesHovered, setIsRubriquesHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const dropdownVisible = isRubriquesHovered || isDropdownHovered;

  // Render the dropdown as a vertical list
  const renderDropdown = () => {
    return (
      <div className="rubriques-dropdown">
        {categories.map((cat) =>
          onCategoryChange ? (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name)}
              className="dropdown-item"
              style={{ color: cat.color }}
            >
              {cat.name}
            </button>
          ) : (
            <Link key={cat.name} href={`/?category=${cat.name}`}>
              <a className="dropdown-item" style={{ color: cat.color }}>
                {cat.name}
              </a>
            </Link>
          )
        )}
      </div>
    );
  };

  return (
    <header className="header">
      {/* Top row: Centered brand */}
      <div className="header-top">
        <Link href="/">
          <a className="brand-link">
            <img src="/media/logo.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">BICÉPHALE</h1>
          </a>
        </Link>
      </div>

      {/* Bottom row: Full-width gray nav bar */}
      <nav className="header-nav">
        <div className="nav-inner">
          <div
            className="nav-item rubriques"
            onMouseEnter={() => setIsRubriquesHovered(true)}
            onMouseLeave={() => setIsRubriquesHovered(false)}
          >
            <span>Rubriques ▾</span>
            {dropdownVisible && (
              <div
                className="dropdown-container"
                onMouseEnter={() => setIsDropdownHovered(true)}
                onMouseLeave={() => setIsDropdownHovered(false)}
              >
                {renderDropdown()}
              </div>
            )}
          </div>
          <Link href="/evenements">
            <a className="nav-item">Événements</a>
          </Link>
          <Link href="/manifeste">
            <a className="nav-item">Manifeste</a>
          </Link>
          <Link href="/banque-des-reves">
            <a className="nav-item">Banque des rêves</a>
          </Link>
          <Link href="/cartographie-des-lieux">
            <a className="nav-item">Cartographie des lieux</a>
          </Link>
          <div className="nav-item search-item">
            <Link href="/indices">
              <a className="search-button" aria-label="Search">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </a>
            </Link>
          </div>
        </div>
      </nav>

      <style jsx>{`
        /* GENERAL OVERRIDES: All anchor tags inside .header get no underline, black color */
        .header a,
        .header a:visited,
        .header a:hover,
        .header a:active {
          text-decoration: none !important;
          color: #000 !important;
        }

        .header {
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          font-family: sans-serif;
        }
        /* TOP ROW: Centered Brand */
        .header-top {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 0;
        }
        .brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .brand-logo {
          height: 60px;
        }
        .brand-title {
          font-size: 36px;
          margin: 0;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
          color: #000;
        }
        /* BOTTOM ROW: Full-Width Gray Navigation */
        .header-nav {
          width: 100%;
          background: #f5f5f5;
          overflow-x: auto;
        }
        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 12px 16px;
          white-space: nowrap;
          position: relative;
        }
        .nav-item {
          font-size: 14px;
          font-weight: 500;
          padding: 8px 4px;
          cursor: pointer;
          position: relative; /* for dropdown positioning */
        }
        /* Search button styles */
        .search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        .search-button svg {
          width: 18px;
          height: 18px;
        }
        /* Rubriques Dropdown: Independent and Vertical */
        .rubriques {
          position: relative;
        }
        .dropdown-container {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          z-index: 10000;
        }
        .rubriques-dropdown {
          background: #fafafa;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          padding: 8px 0;
          min-width: 150px;
        }
        .dropdown-item {
          display: block;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          border: none;
          background: none;
          text-decoration: none;
          color: inherit;
        }
        .dropdown-item:hover {
          background: #eee;
        }

        /* Optional scrollbar styling for nav-inner */
        .header-nav::-webkit-scrollbar {
          height: 6px;
        }
        .header-nav::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
      `}</style>
    </header>
  );
};

export default Header;
