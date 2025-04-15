// /app/components/Header.tsx
import React, { useState } from 'react';
import Link from 'next/link';

export type Category = { name: string; color: string };

export type HeaderProps = {
  categories: Category[];
  activeCategory?: string | null;
  onCategoryChange?: (category: string) => void;
  layout?: 'vertical' | 'horizontal';
};

const Header: React.FC<HeaderProps> = ({
  categories,
  onCategoryChange,
  layout = 'horizontal',
}) => {
  const [isRubriquesHovered, setIsRubriquesHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const dropdownVisible = isRubriquesHovered || isDropdownHovered;

  // Category item style for the dropdown
  const categoryItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'none',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    color: '#000',
  };

  const renderDropdown = () => {
    return (
      <div
        className="rubriques-dropdown"
        onMouseEnter={() => setIsDropdownHovered(true)}
        onMouseLeave={() => setIsDropdownHovered(false)}
      >
        {categories.map((cat) =>
          onCategoryChange ? (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name)}
              style={{ ...categoryItemStyle, color: cat.color }}
              className="cat-item"
            >
              {cat.name}
            </button>
          ) : (
            <Link key={cat.name} href={`/?category=${cat.name}`}>
              <a
                style={{ ...categoryItemStyle, color: cat.color }}
                className="cat-item"
              >
                {cat.name}
              </a>
            </Link>
          )
        )}
      </div>
    );
  };

  // "Rubriques" menu item
  const rubriquesMenu = (
    <div
      className="nav-item rubriques"
      onMouseEnter={() => setIsRubriquesHovered(true)}
      onMouseLeave={() => setIsRubriquesHovered(false)}
    >
      Rubriques ▾
      {dropdownVisible && renderDropdown()}
    </div>
  );

  // Additional menu items
  const menuItems = (
    <>
      {rubriquesMenu}
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
    </>
  );

  /********************************************************
   * VERTICAL LAYOUT
   ********************************************************/
  if (layout === 'vertical') {
    return (
      <div className="vertical-header">
        <Link href="/">
          <a className="vertical-brand">
            <img src="/media/logo.png" alt="Logo" className="vertical-logo" />
            <h1 className="vertical-title">BICÉPHALE</h1>
          </a>
        </Link>
        <nav className="vertical-nav">{menuItems}</nav>

        <style jsx>{`
          .vertical-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 250px;
            height: 100vh;
            padding: 20px;
            box-sizing: border-box;
            background: rgba(248,248,248,0.95);
            backdrop-filter: blur(8px);
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 1000;
          }
          .vertical-brand {
            text-decoration: none;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            color: #000 !important;
          }
          .vertical-logo {
            height: 60px;
          }
          .vertical-title {
            font-size: 34px;
            margin: 0;
            color: #000 !important;
            font-family: "GayaRegular", "RecoletaMedium", sans-serif;
          }
          .vertical-nav {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .nav-item,
          .nav-item a {
            color: #000 !important;
            text-decoration: none !important;
          }
          .rubriques {
            position: relative; /* needed so dropdown can absolutely position */
          }
          .rubriques-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: #fafafa;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            border-radius: 4px;
            padding: 8px 0;
            z-index: 9999;
          }
          .cat-item:hover {
            background: #eee;
          }
        `}</style>
      </div>
    );
  }

  /********************************************************
   * HORIZONTAL LAYOUT (DEFAULT)
   ********************************************************/
  return (
    <header className="header">
      {/* Top row: brand centered */}
      <div className="header-top">
        <Link href="/">
          <a className="brand-link">
            <img src="/media/logo.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">BICÉPHALE</h1>
          </a>
        </Link>
      </div>

      {/* Bottom row: wide, subtle gray, centered nav with horizontal scroll */}
      <nav className="header-nav">
        <div className="nav-inner">{menuItems}</div>
      </nav>

      <style jsx>{`
        .header {
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        /* TOP ROW */
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
          text-decoration: none !important;
          color: #000 !important;
        }
        .brand-link:visited {
          color: #000 !important;
        }
        .brand-logo {
          height: 60px;
        }
        .brand-title {
          font-size: 36px;
          margin: 0;
          line-height: 1;
          color: #000 !important;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }

        /* BOTTOM ROW (GRAY) */
        .header-nav {
          width: 100%;
          background: #f5f5f5;
          overflow-x: auto; /* horizontal scroll if needed */
        }

        .nav-inner {
          display: inline-flex;
          align-items: center;
          gap: 24px;
          white-space: nowrap;
          padding: 12px 16px;
          margin: 0 auto;
        }

        /* Custom scrollbar styling (optional) */
        .header-nav::-webkit-scrollbar {
          height: 6px;
        }
        .header-nav::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }

        /* Menu Items */
        .nav-item,
        .nav-item a {
          color: #000 !important;
          text-decoration: none !important;
          font-size: 14px;
          font-weight: 500;
          position: relative;
          cursor: pointer;
          padding: 8px 4px;
        }
        .nav-item:visited,
        .nav-item a:visited {
          color: #000 !important;
        }

        /* "Rubriques" specifically (for the dropdown) */
        .rubriques {
          position: relative; /* allows absolutely positioned dropdown */
        }
        .rubriques-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 150px;
          background: #fafafa;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border-radius: 4px;
          padding: 8px 0;
          z-index: 9999; /* ensure it floats above the gray row */
        }
        .cat-item {
          display: block;
          text-decoration: none !important;
          color: inherit;
        }
        .cat-item:hover {
          background: #eee;
        }

        /* Search button */
        .search-item {
          display: flex;
        }
        .search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000 !important;
          text-decoration: none !important;
          padding: 4px;
        }
        .search-button svg {
          width: 18px;
          height: 18px;
        }

        /* Media queries for spacing on large screens */
        @media (min-width: 1024px) {
          .nav-inner {
            gap: 32px;
            padding: 12px 40px;
          }
          .nav-item {
            font-size: 15px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
