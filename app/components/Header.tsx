// /app/components/Header.tsx
import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';

export type Category = { name: string; color: string };

export type HeaderProps = {
  categories: Category[];
  onCategoryChange?: (category: string) => void;
};

const Header: React.FC<HeaderProps> = ({ categories, onCategoryChange }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [triggerHovered, setTriggerHovered] = useState(false);
  const [dropdownHovered, setDropdownHovered] = useState(false);

  const rubriquesRef = useRef<HTMLDivElement>(null);

  const showDropdown = () => {
    if (rubriquesRef.current) {
      const rect = rubriquesRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setDropdownVisible(true);
  };

  const hideDropdown = () => setDropdownVisible(false);

  const hideDropdownWithDelay = () => {
    setTimeout(() => {
      if (!triggerHovered && !dropdownHovered) {
        hideDropdown();
      }
    }, 120);
  };

  const handleTriggerMouseEnter = () => {
    setTriggerHovered(true);
    showDropdown();
  };
  const handleTriggerMouseLeave = () => {
    setTriggerHovered(false);
    hideDropdownWithDelay();
  };
  const handleDropdownMouseEnter = () => setDropdownHovered(true);
  const handleDropdownMouseLeave = () => {
    setDropdownHovered(false);
    hideDropdownWithDelay();
  };

  const dropdownContent = (
    <div className="rubriques-dropdown">
      {categories.map((cat) =>
        onCategoryChange ? (
          <button
            key={cat.name}
            onClick={() => {
              onCategoryChange(cat.name);
              hideDropdown();
            }}
            className="dropdown-item"
            style={{ color: cat.color }}
          >
            {cat.name}
          </button>
        ) : (
          <Link key={cat.name} href={`/?category=${cat.name}`}>
            <a className="dropdown-item" style={{ color: cat.color }} onClick={hideDropdown}>
              {cat.name}
            </a>
          </Link>
        )
      )}
    </div>
  );

  const dropdownPortal = dropdownVisible
    ? ReactDOM.createPortal(
        <div
          className="dropdown-portal"
          style={{
            position: 'absolute',
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 10000,
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          {dropdownContent}
        </div>,
        document.body
      )
    : null;

  return (
    <header className="header">
      <div className="header-top">
        <Link href="/">
          <a className="brand-link">
            <img src="/media/logo.png" alt="Logo" className="brand-logo" />
            <h1 className="brand-title">BICÉPHALE</h1>
          </a>
        </Link>
      </div>
      <nav className="header-nav">
        <div className="nav-inner">
          <div
            className="nav-item rubriques"
            ref={rubriquesRef}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
          >
            <span>Rubriques ▾</span>
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
      {dropdownPortal}
      <style jsx>{`
        :global(.header a),
        :global(.header a:visited),
        :global(.header a:hover),
        :global(.header a:active) {
          text-decoration: none !important;
          color: #000 !important;
        }
        .header {
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1000;
          font-family: sans-serif;
        }
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
          position: relative;
        }
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
        /* Updated Dropdown styles for a vertical list */
        .rubriques-dropdown {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          background: #cce2d0 !important;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          min-width: 160px;
          padding: 8px 0;
          white-space: normal !important; /* override "nowrap" */
        }

        .rubriques-dropdown .dropdown-item {
          display: block !important;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none !important;
          color: #000 !important;
          width: 100% !important;
          white-space: normal !important;
        }

        .rubriques-dropdown .dropdown-item:hover {
          background: #b6d4b9 !important;
        }
      `}</style>
    </header>
  );
};

export default Header;