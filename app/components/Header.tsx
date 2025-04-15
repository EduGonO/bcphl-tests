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
  // Hover states to manage the Rubriques dropdown
  const [isRubriquesHovered, setIsRubriquesHovered] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const dropdownVisible = isRubriquesHovered || isDropdownHovered;

  // Reusable style for category items inside the dropdown
  const categoryItemStyle: React.CSSProperties = {
    border: 'none',
    background: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'normal',
    padding: '5px 10px',
    color: '#333',
    textAlign: 'left',
    textDecoration: 'none',
    width: '100%',
  };

  // Renders the actual dropdown with category items
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
            >
              {cat.name}
            </button>
          ) : (
            <Link key={cat.name} href={`/?category=${cat.name}`}>
              <a style={{ ...categoryItemStyle, color: cat.color }}>
                {cat.name}
              </a>
            </Link>
          )
        )}
      </div>
    );
  };

  // The second-row menu item for "Rubriques" + dropdown
  const rubriquesMenu = (
    <div
      className="nav-item rubriques"
      onMouseEnter={() => setIsRubriquesHovered(true)}
      onMouseLeave={() => setIsRubriquesHovered(false)}
    >
      Rubriques
      {dropdownVisible && renderDropdown()}
    </div>
  );

  // Additional menu items from your design
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
          <a className="search-button">
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

  /********************************
   * VERTICAL LAYOUT (unchanged)
   *******************************/
  if (layout === 'vertical') {
    return (
      <div className="vertical-header">
        <Link href="/">
          <a className="vertical-brand">
            <img src="/media/logo.png" alt="Logo" className="vertical-logo" />
            <h1 className="vertical-title">BICÉPHALE</h1>
          </a>
        </Link>
        <div className="vertical-rubriques">
          {rubriquesMenu}
        </div>
        {menuItems /* if you want the other items in vertical layout too */}
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
          }
          .vertical-logo {
            height: 60px;
          }
          .vertical-title {
            font-size: 34px;
            margin: 0;
            color: #333;
            font-family: "GayaRegular", "RecoletaMedium", sans-serif;
          }
          .vertical-rubriques {
            position: relative;
            display: inline-block;
          }
          .rubriques-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            left: 0;
            right: 0;
            background: #f8f8f8;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border-radius: 4px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
          }
        `}</style>
      </div>
    );
  }

  /********************************
   * HORIZONTAL LAYOUT (new design)
   *******************************/
  return (
    <header className="header">
      {/* Top row: Centered logo + brand */}
      <div className="header-top">
        <Link href="/">
          <a className="brand-link">
            <img src="/media/logo.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">BICÉPHALE</h1>
          </a>
        </Link>
      </div>

      {/* Bottom row: Nav items */}
      <nav className="header-nav">
        {menuItems}
      </nav>

      {/* Styled JSX */}
      <style jsx>{`
        .header {
          position: relative;
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }
        /* Top row: center the brand */
        .header-top {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 10px 0;
        }
        .brand-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          gap: 10px;
        }
        .brand-logo {
          height: 60px;
        }
        .brand-title {
          font-size: 36px;
          margin: 0;
          line-height: 1;
          color: #000;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
        }

        /* Bottom row: horizontal nav */
        .header-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          padding: 10px 0;
          border-top: 1px solid #ddd;
        }
        .nav-item {
          font-size: 14px;
          text-decoration: none;
          color: #333;
          font-weight: 500;
          cursor: pointer;
          position: relative; /* for dropdown positioning */
          padding: 8px 4px;
        }
        /* "Rubriques" hover dropdown */
        .rubriques-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 180px;
          background: #e0e8e3; /* example tinted background, or use your category color here */
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          border-radius: 4px;
          padding: 8px 0;
          z-index: 2000;
          display: flex;
          flex-direction: column;
        }
        /* If you want each category's background: you could remove the global background 
           and only color each item individually. This is just a simple tinted approach. */

        /* Search icon style */
        .search-button {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
        }
        .search-button svg {
          width: 18px;
          height: 18px;
        }

        /* Example media query if you want more spacing on wide screens */
        @media (min-width: 1024px) {
          .header-nav {
            gap: 40px;
            padding: 12px 0;
          }
          .nav-item {
            font-size: 16px;
            padding: 10px 6px;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
