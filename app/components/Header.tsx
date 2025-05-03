// /app/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Link from 'next/link';
import { categoryConfigMap, getCategoryLink } from '../../config/categoryColors';

export type Category = { name: string; color: string };

export type HeaderProps = {
  categories: Category[];
  onCategoryChange?: (category: string) => void;
};

const Header: React.FC<HeaderProps> = ({ categories, onCategoryChange }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [triggerHovered, setTriggerHovered] = useState(false);
  const [dropdownHovered, setDropdownHovered] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  const rubriquesRef = useRef<HTMLDivElement>(null);

  // Get all available categories from the config map
  const allConfiguredCategories = Object.keys(categoryConfigMap).map(name => ({
    name,
    color: categoryConfigMap[name].color
  }));

  // Combine configured categories with those passed via props to ensure all categories are available
  const mergedCategories = [...allConfiguredCategories];
  
  // Add any categories from props that might not be in the config (fallback)
  categories.forEach(cat => {
    if (!mergedCategories.some(c => c.name === cat.name)) {
      mergedCategories.push(cat);
    }
  });

  // Set up portal container on client side only
  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  // Adjust the computed position with improved positioning logic
  const showDropdown = () => {
    if (rubriquesRef.current) {
      const rect = rubriquesRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      
      // For desktop: align dropdown with the left edge of the trigger
      // For mobile: apply special handling for full width or centered dropdown
      if (isMobile) {
        // Full width on very small screens, otherwise centered with max-width
        if (window.innerWidth < 480) {
          setDropdownPos({
            top: rect.bottom + window.scrollY,
            left: 0,
          });
        } else {
          // Center the dropdown for medium-small screens
          const dropdownWidth = 220; // Approximate width of dropdown
          const leftPos = Math.max(0, (window.innerWidth - dropdownWidth) / 2);
          setDropdownPos({
            top: rect.bottom + window.scrollY,
            left: leftPos,
          });
        }
      } else {
        // Desktop positioning - align with trigger
        setDropdownPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    }
    setDropdownVisible(true);
  };

  const hideDropdown = () => setDropdownVisible(false);

  // More robust dropdown handling with proper timing
  const hideDropdownWithDelay = () => {
    // Use a longer delay to prevent accidental closing when moving between trigger and dropdown
    setTimeout(() => {
      if (!triggerHovered && !dropdownHovered) {
        hideDropdown();
      }
    }, 150);
  };

  // Add click handler for mobile/touch devices
  const handleTriggerClick = () => {
    if (dropdownVisible) {
      hideDropdown();
    } else {
      showDropdown();
    }
  };

  const handleTriggerMouseEnter = () => {
    setTriggerHovered(true);
    // Small delay before showing dropdown prevents flickering on accidental hover
    setTimeout(() => {
      if (triggerHovered) {
        showDropdown();
      }
    }, 50);
  };
  
  const handleTriggerMouseLeave = () => {
    setTriggerHovered(false);
    hideDropdownWithDelay();
  };
  
  const handleDropdownMouseEnter = () => {
    setDropdownHovered(true);
  };
  
  const handleDropdownMouseLeave = () => {
    setDropdownHovered(false);
    hideDropdownWithDelay();
  };

  // Create the dropdown content with improved animations and styling
  const dropdownContent = (
    <div className="rubriques-dropdown">
      {mergedCategories
        .filter((cat) => categoryConfigMap[cat.name]?.showInDropdown)
        .map((cat, index) => {
          const config = categoryConfigMap[cat.name];
          const categoryLink = getCategoryLink(cat.name);
          
          return (
            <Link key={cat.name} href={categoryLink}>
              <a 
                className="dropdown-item" 
                style={{ 
                  color: config.color,
                  // Staggered animation for items (slightly delayed appearance)
                  transitionDelay: `${index * 30}ms`,
                  opacity: dropdownVisible ? 1 : 0,
                  transform: dropdownVisible ? 'translateY(0)' : 'translateY(-5px)'
                }}
                onClick={() => onCategoryChange && onCategoryChange(cat.name)}
              >
                {cat.name}
              </a>
            </Link>
          );
        })}
    </div>
  );

  // Get header nav items
  const headerNavItems = mergedCategories
    .filter((cat) => categoryConfigMap[cat.name]?.showInHeader)
    .map((cat) => {
      const categoryLink = getCategoryLink(cat.name);
      return (
        <Link key={cat.name} href={categoryLink}>
          <a 
            className="nav-item"
            onClick={() => onCategoryChange && onCategoryChange(cat.name)}
          >
            {cat.name}
          </a>
        </Link>
      );
    });

  // Render the dropdown in a portal with improved styling and animation.
  const dropdownPortal = portalContainer
    ? ReactDOM.createPortal(
        <div
          className={`dropdown-portal ${dropdownVisible ? 'visible' : ''}`}
          style={{
            position: 'absolute',
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 10000,
            // On mobile, occupy full width.
            width: window.innerWidth < 768 ? '100%' : 'auto',
            opacity: dropdownVisible ? 1 : 0,
            transform: dropdownVisible ? 'translateY(0)' : 'translateY(-10px)',
            pointerEvents: dropdownVisible ? 'auto' : 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        >
          {dropdownContent}
        </div>,
        portalContainer
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
            className={`nav-item rubriques ${dropdownVisible ? 'active' : ''}`}
            ref={rubriquesRef}
            onMouseEnter={handleTriggerMouseEnter}
            onMouseLeave={handleTriggerMouseLeave}
            onClick={handleTriggerClick}
          >
            <span>Rubriques</span>
            <svg 
              className="dropdown-caret" 
              width="10" 
              height="6" 
              viewBox="0 0 10 6" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{
                marginLeft: '4px',
                transition: 'transform 0.2s ease',
                transform: dropdownVisible ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          {/* Dynamically render header nav items based on categoryConfigMap */}
          {headerNavItems}
          
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
        /* Add global styles for transitions */
        :global(*) {
          box-sizing: border-box;
        }
        :global(.dropdown-portal) {
          will-change: transform, opacity;
        }
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
          padding: 8px 12px;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        .nav-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .nav-item.active, .nav-item.rubriques:hover {
          background-color: rgba(0, 0, 0, 0.08);
        }
        .nav-item.rubriques {
          display: flex;
          align-items: center;
          gap: 4px;
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
        /* Improved dropdown styling for a traditional vertical dropdown menu */
        .rubriques-dropdown {
          display: flex;
          flex-direction: column;
          min-width: 180px;
          background: #ffffff;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 8px 0;
          border: 1px solid #e0e0e0;
          overflow: hidden; /* Ensures content respects border radius */
        }
        .dropdown-item {
          display: block;
          padding: 10px 16px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.25s ease;
          border-left: 3px solid transparent;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .dropdown-item:hover {
          background: #f5f5f5;
          border-left-color: currentColor; /* Uses the text color for the left border */
        }
        .dropdown-item:active {
          background: #e8e8e8;
        }
        .dropdown-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: #f0f0f0;
        }
        .dropdown-item:last-child::after {
          display: none; /* No divider after last item */
        }
      `}</style>
    </header>
  );
};

export default Header;