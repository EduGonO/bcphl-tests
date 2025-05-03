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
    
    // Add CSS variables for category colors to use in hover effects
    document.documentElement.style.setProperty('--default-category-color', '#333');
    
    // Setup event delegation for hover effects
    const handleMouseOver = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('dropdown-item')) {
        const color = target.getAttribute('data-category-color') || '#333';
        document.documentElement.style.setProperty('--category-color', color);
      }
    };
    
    document.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Adjust the computed position with improved positioning logic
  const showDropdown = () => {
    if (rubriquesRef.current) {
      const rect = rubriquesRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      
      // For desktop: align dropdown with the left edge of the trigger
      // For mobile: apply special handling for centered dropdown
      if (isMobile) {
        // Center the dropdown for all mobile screens
        // Use fixed position for mobile to avoid scrolling issues
        setDropdownPos({
          top: rect.bottom,
          // For mobile, we'll center it with CSS margins instead of absolute positioning
          left: window.innerWidth / 2,
        });
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
                  // Use consistent text color instead of category color for text
                  // Category color will be used on hover via CSS
                  // Staggered animation for items (slightly delayed appearance)
                  transitionDelay: `${index * 30}ms`,
                  opacity: dropdownVisible ? 1 : 0,
                  transform: dropdownVisible ? 'translateY(0)' : 'translateY(-5px)'
                }}
                data-category-color={config.color}
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
            position: 'fixed', // Changed from absolute to fixed for better mobile positioning
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 10000,
            // On mobile, occupy full width and center
            width: window.innerWidth < 768 ? 'calc(100% - 32px)' : 'auto',
            maxWidth: '300px', // Limit width for better readability
            opacity: dropdownVisible ? 1 : 0,
            transform: dropdownVisible ? 'translateY(0)' : 'translateY(-10px)',
            pointerEvents: dropdownVisible ? 'auto' : 'none',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            margin: window.innerWidth < 768 ? '0 16px' : '0', // Add margin on mobile
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
        :global(.header a:active) {
          text-decoration: none !important;
          color: #000 !important;
        }
        :global(.header-nav a:hover) {
          text-decoration: none !important;
          color: #000 !important;
        }
        /* Elegant dropdown styles with blur effect and better mobile support */
        :global(.rubriques-dropdown) {
          display: flex;
          flex-direction: column !important;
          min-width: 180px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          padding: 8px 0;
          border: 1px solid rgba(230, 230, 230, 0.8);
          overflow: hidden;
        }
        :global(.dropdown-item) {
          display: block !important;
          width: 100% !important;
          padding: 12px 16px !important;
          font-size: 14px;
          text-align: left;
          white-space: nowrap;
          color: #333 !important;
          text-decoration: none !important;
          position: relative;
          transition: all 0.2s ease;
        }
        :global(.dropdown-item:hover) {
          background-color: rgba(240, 240, 240, 0.8) !important;
        }
        /* Dynamic hover color based on data-attribute */
        :global(.dropdown-item:hover::before) {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background-color: var(--category-color);
        }
        @media (max-width: 767px) {
          :global(.dropdown-portal) {
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: calc(100% - 32px) !important;
          }
          :global(.dropdown-portal.visible) {
            transform: translateX(-50%) translateY(0) !important;
          }
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
          -webkit-overflow-scrolling: touch; /* Improve mobile scrolling */
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
        /* Mobile enhancements */
        @media (max-width: 767px) {
          .header-nav {
            padding: 0 8px;
          }
          .nav-inner {
            padding: 10px 8px;
            gap: 16px;
          }
          .nav-item {
            padding: 6px 8px;
            font-size: 13px;
          }
          .brand-title {
            font-size: 28px;
          }
          .brand-logo {
            height: 48px;
          }
        }
        
        /* Add padding to ensure items at the edge are fully visible when scrolling */
        @media (max-width: 767px) {
          .nav-inner::before,
          .nav-inner::after {
            content: '';
            min-width: 8px;
          }
        }
        
        /* Elegant dropdown styling with proper spacing and dividers */
        .rubriques-dropdown {
          display: flex;
          flex-direction: column;
          min-width: 180px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          padding: 8px 0;
          border: 1px solid rgba(230, 230, 230, 0.8);
          overflow: hidden;
        }
        .dropdown-item {
          display: block;
          padding: 12px 16px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          width: 100%;
          position: relative;
          overflow: hidden;
          color: #333;
        }
        .dropdown-item:hover {
          background: rgba(245, 245, 245, 0.8);
        }
        .dropdown-item:active {
          background: rgba(235, 235, 235, 0.9);
        }
        .dropdown-item::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 16px;
          width: calc(100% - 32px);
          height: 1px;
          background: rgba(240, 240, 240, 0.8);
        }
        .dropdown-item:last-child::after {
          display: none; /* No divider after last item */
        }
      `}</style>
    </header>
  );
};

export default Header;