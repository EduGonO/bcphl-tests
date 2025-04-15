// /app/components/Header.tsx
import React, { useState } from 'react';
import Link from 'next/link';

export type Category = { name: string; color: string };

export type HeaderProps = {
  categories: Category[];
  onCategoryChange?: (category: string) => void;
};

const Header: React.FC<HeaderProps> = ({ categories, onCategoryChange }) => {
  // Manage hover state for "Rubriques"
  const [isRubriquesHovered, setIsRubriquesHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const dropdownVisible = isRubriquesHovered || isDropdownHovered;

  // Render the vertical dropdown list for Rubriques
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
      {/* Top Row: Logo and Brand */}
      <div className="header-top">
        <Link href="/">
          <a className="brand-link">
            <img src="/media/logo.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">BICÉPHALE</h1>
          </a>
        </Link>
      </div>

      {/* Bottom Row: Navigation Bar */}
      <div className="header-bottom">
        <nav className="nav-bar">
          <div className="nav-menu">
            {/* Rubriques with Dropdown */}
            <div
              className="nav-item rubriques"
              onMouseEnter={() => setIsRubriquesHovered(true)}
              onMouseLeave={() => setIsRubriquesHovered(false)}
            >
              <span>Rubriques ▾</span>
              {dropdownVisible && (
                <div
                  className="rubriques-dropdown-container"
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
      </div>

      <style jsx>{`
        /* GENERAL HEADER STYLES */
        .header {
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header a {
          text-decoration: none !important;
          color: #000 !important;
        }
        /* TOP ROW: CENTERED BRAND */
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
        /* BOTTOM ROW: FULL-WIDTH GRAY NAVIGATION */
        .header-bottom {
          width: 100%;
          background: #f5f5f5;
        }
        .nav-bar {
          width: 100%;
          overflow-x: auto;
        }
        .nav-menu {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          position: relative;
          padding: 12px 16px;
          white-space: nowrap;
        }
        .nav-item {
          position: relative;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 4px;
          cursor: pointer;
        }
        /* Ensure no underlines or blue visuals on links */
        .nav-item a {
          text-decoration: none !important;
          color: #000 !important;
        }
        /* Search button styling */
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
        /* Rubriques Dropdown: Absolutely Positioned */
        .rubriques-dropdown-container {
          position: absolute;
          top: 100%;
          left: 0;
          transform: translateY(4px);
          z-index: 10000;
        }
        .rubriques-dropdown {
          background: #fafafa;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border-radius: 4px;
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
        }
        .dropdown-item:hover {
          background: #eee;
        }
      `}</style>
    </header>
  );
};

export default Header;
