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
  activeCategory,
  onCategoryChange,
  layout = 'horizontal',
}) => {
  const [isRubriquesHovered, setIsRubriquesHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const dropdownVisible = isRubriquesHovered || isDropdownHovered;

  // Style applied to all category items in the dropdown
  const categoryItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textAlign: 'left',
    textDecoration: 'none',
    width: '100%',
    color: '#000',
  };

  // Renders the dropdown with vertical list of categories
  const renderDropdown = () => {
    return (
      <div className="rubriques-dropdown"
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
              <a style={{ ...categoryItemStyle, color: cat.color }} className="cat-item">
                {cat.name}
              </a>
            </Link>
          )
        )}
      </div>
    );
  };

  // "Rubriques" menu item with dropdown
  const rubriquesMenu = (
    <div className="nav-item rubriques"
         onMouseEnter={() => setIsRubriquesHovered(true)}
         onMouseLeave={() => setIsRubriquesHovered(false)}>
      <span>Rubriques ▾</span>
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

  /****************************************************************
   * VERTICAL LAYOUT (SIDEBAR)
   ****************************************************************/
  if (layout === 'vertical') {
    return (
      <div className="vertical-header">
        <Link href="/">
          <a className="vertical-brand">
            <img src="/media/logo.png" alt="Logo" className="vertical-logo" />
            <h1 className="vertical-title">BICÉPHALE</h1>
          </a>
        </Link>
        {/* Optionally include navigation for vertical layout */}
        <nav className="vertical-nav">
          {menuItems}
        </nav>

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
            color: #000;
          }
          .vertical-logo {
            height: 60px;
          }
          .vertical-title {
            font-size: 34px;
            margin: 0;
            color: #000;
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
            text-decoration: none;
            color: #000;
          }
          .rubriques-dropdown {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: #fafafa;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            padding: 8px 0;
            z-index: 2000;
          }
          .cat-item:hover {
            background: #eee;
          }
        `}</style>
      </div>
    );
  }

  /****************************************************************
   * HORIZONTAL LAYOUT (TWO ROWS)
   ****************************************************************/
  return (
    <header className="header">
      {/* Top row: center the brand */}
      <div className="header-top">
        <Link href="/">
          <a className="brand-link">
            <img src="/media/logo.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">BICÉPHALE</h1>
          </a>
        </Link>
      </div>

      {/* Bottom row: centered nav items in a horizontally scrollable row */}
      <nav className="header-nav">
        {menuItems}
      </nav>

      <style jsx>{`
        .header {
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
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
          text-decoration: none;
          color: #000;
        }
        .brand-logo {
          height: 60px;
        }
        .brand-title {
          font-size: 36px;
          margin: 0;
          line-height: 1;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
          color: #000;
        }
        /* BOTTOM ROW */
        .header-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          white-space: nowrap;
          overflow-x: auto;
          padding: 12px 16px;
          background: #f5f5f5;
          margin: 0;
        }
        .header-nav::-webkit-scrollbar {
          height: 6px;
        }
        .header-nav::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }
        .nav-item {
          display: inline-block;
          font-size: 14px;
          text-decoration: none;
          color: #000;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          padding: 8px 4px;
        }
        .nav-item:visited,
        .nav-item a:visited {
          color: #000;
        }
        /* "Rubriques" dropdown */
        .rubriques-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 180px;
          background: #fafafa;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          padding: 8px 0;
          z-index: 2000;
        }
        .cat-item {
          display: block;
          text-decoration: none;
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
          color: #000;
          text-decoration: none;
          padding: 4px;
        }
        .search-button svg {
          width: 18px;
          height: 18px;
        }

        /* Center the nav items in the row */
        .header-nav {
          margin-left: auto;
          margin-right: auto;
        }

        @media (min-width: 1024px) {
          .header-nav {
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
