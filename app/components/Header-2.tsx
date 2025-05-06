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
  // States for dropdown functionality
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [triggerHovered, setTriggerHovered] = useState(false);
  const [dropdownHovered, setDropdownHovered] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const rubriquesRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Get all available categories - combine configured ones with props
  const allConfiguredCategories = Object.keys(categoryConfigMap).map(name => ({
    name,
    color: categoryConfigMap[name].color
  }));

  const mergedCategories = [...allConfiguredCategories];
  
  // Add any categories from props that might not be in the config
  categories.forEach(cat => {
    if (!mergedCategories.some(c => c.name === cat.name)) {
      mergedCategories.push(cat);
    }
  });

  // top of file, after other state
const MAX_SCROLL = 100;          // px to reach full “compact”
useEffect(() => {
  document.documentElement.style.setProperty('--header-progress', '0');
}, []);

// inside existing useEffect, replace handleScroll body
const handleScroll = () => {
  const y = window.scrollY;
  const p = Math.min(y / MAX_SCROLL, 1);              // 0 → 1
  document.documentElement.style.setProperty('--header-progress', p.toString());
  setIsScrolled(p === 1);                             // keep boolean for margins etc.

  if (dropdownVisible && rubriquesRef.current) {
    const r = rubriquesRef.current.getBoundingClientRect();
    setDropdownPos({ top: r.bottom + (isMobile ? 2 : 6), left: isMobile ? r.left : r.left + window.scrollX });
  }
};

  // Set up portal container and responsive behavior
  useEffect(() => {
    // Set portal container
    setPortalContainer(document.body);
    
    // Add CSS variables for category colors
    document.documentElement.style.setProperty('--default-category-color', '#333');
    
    // Check if mobile on load and when window resizes
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Setup event delegation for hover effects
    const handleMouseOver = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('dropdown-item')) {
        const color = target.getAttribute('data-category-color') || '#333';
        document.documentElement.style.setProperty('--category-color', color);
      }
    };
    
    // Handle scroll events for sticky header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Update dropdown position if it's visible
      if (dropdownVisible && rubriquesRef.current) {
        const rect = rubriquesRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + (isMobile ? 2 : 6),
          left: isMobile ? rect.left : rect.left + window.scrollX
        });
      }
    };
    
    document.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dropdownVisible, isMobile]);

  // Show dropdown with enhanced positioning
  const showDropdown = () => {
    if (rubriquesRef.current) {
      const rect = rubriquesRef.current.getBoundingClientRect();
      
      // Precise positioning based on device type
      setDropdownPos({
        top: rect.bottom + (isMobile ? 2 : 6), // Add slight offset for visual separation
        left: isMobile ? rect.left : rect.left + window.scrollX
      });
    }
    setDropdownVisible(true);
  };

  const hideDropdown = () => setDropdownVisible(false);

  // Improved dropdown timing for better UX
  const hideDropdownWithDelay = () => {
    setTimeout(() => {
      if (!triggerHovered && !dropdownHovered) {
        hideDropdown();
      }
    }, 120); // Slightly faster delay for more responsive feel
  };

  // Handlers for mouse events
  const handleTriggerClick = () => {
    if (dropdownVisible) {
      hideDropdown();
    } else {
      showDropdown();
    }
  };

  const handleTriggerMouseEnter = () => {
    setTriggerHovered(true);
    setTimeout(() => {
      if (triggerHovered) {
        showDropdown();
      }
    }, 40); // Faster hover response
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

  // Enhanced dropdown content with better animation timing
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
                  transitionDelay: `${index * 25}ms`, // Slightly faster stagger for smoother effect
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

  // Header nav items
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

  // Render the dropdown with enhanced styling
  const dropdownPortal = portalContainer
    ? ReactDOM.createPortal(
        <div
          className={`dropdown-portal ${dropdownVisible ? 'visible' : ''}`}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 10000,
            maxWidth: isMobile ? '90vw' : '300px',
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
    <header className={`header ${isScrolled ? 'scrolled' : ''}`} ref={headerRef}>
      <div className="header-container">
        <div className="header-content">
          <Link href="/">
            <a className="brand-link">
              <img src="/media/logo.png" alt="Logo" className="brand-logo" />
              <h1 className="brand-title">BICÉPHALE</h1>
            </a>
          </Link>
          
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
        </div>
      </div>
      {dropdownPortal}
      <style jsx>{`
        /* Base reset */
/* ── base reset ───────────────────────────────────────── */
:global(*){box-sizing:border-box}
:root{--header-progress:0}
:global(.dropdown-portal){will-change:transform,opacity;backface-visibility:hidden}

/* links */
:global(.header a),
:global(.header a:visited),
:global(.header a:active),
:global(.header-nav a:hover){text-decoration:none!important;color:#000!important}
:global(.dropdown-item),
:global(.dropdown-item:hover),
:global(.dropdown-item:visited),
:global(.dropdown-item:active){text-decoration:none!important}
:global(.dropdown-portal a),
:global(.dropdown-portal a:hover),
:global(.dropdown-portal a:visited),
:global(.dropdown-portal a:active){text-decoration:none!important;color:#333!important}

/* ── dropdown panel ───────────────────────────────────── */
:global(.rubriques-dropdown){
  display:flex;flex-direction:column!important;min-width:180px;
  background:rgba(255,255,255,.64);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);
  border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.08),0 2px 8px rgba(0,0,0,.06);
  padding:6px 0;border:1px solid rgba(230,230,230,.6);overflow:hidden;transform-origin:top center
}
:global(.dropdown-item){
  display:block!important;width:100%!important;padding:12px 16px!important;font-size:14px;
  letter-spacing:.01em;white-space:nowrap;color:#333!important;position:relative;transition:all .2s ease
}
:global(.dropdown-item:hover){background:rgba(245,245,245,.95)!important}
:global(.dropdown-item:hover::before){
  content:'';position:absolute;left:0;top:50%;height:60%;width:3px;transform:translateY(-50%);
  background:var(--category-color);border-radius:0 2px 2px 0;opacity:.85
}

/* ── header shell ─────────────────────────────────────── */
.header{
  width:100%;background:transparent;position:fixed;top:0;left:0;right:0;z-index:1000;
  font-family:-apple-system,InterRegular,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;
  transition:all .3s ease
}
.header.scrolled{
  background:rgba(255,255,255,.84);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);
  box-shadow:0 2px 10px rgba(0,0,0,.05)
}
.header-container{width:100%;max-width:1440px;margin:0 auto;padding:0 16px}
.header-content{display:flex;flex-direction:column;align-items:center;transition:all .3s ease}
.header.scrolled .header-content{flex-direction:row;justify-content:space-between;align-items:center}

/* ── brand block (interpolated) ───────────────────────── */
.brand-link{
  display:flex;align-items:center;gap:12px;transition:all .3s ease;
  padding:calc(15px - 7px*var(--header-progress)) 0 calc(12px - 4px*var(--header-progress))
}
.brand-logo{height:calc(58px - 22px*var(--header-progress));transition:height .3s ease}
.brand-title{
  font-size:calc(42px - 12px*var(--header-progress));margin:0;font-weight:200;
  font-family:"GayaRegular","RecoletaMedium",sans-serif;letter-spacing:.02em;transition:font-size .3s ease
}

/* ── navigation strip ─────────────────────────────────── */
.header-nav,
.header.scrolled .header-nav{
  background:transparent!important;        /* unified blurred sheet */
  width:auto;position:relative;
  overflow-x:auto;overflow-y:hidden;       /* ▲ stop vertical scroll */
  transition:all .3s ease;margin-left:0!important
}
.header-nav::-webkit-scrollbar{display:none}

.nav-inner{
  max-width:1200px;margin:0 auto;display:flex;align-items:center;white-space:nowrap;position:relative;
  gap:calc(24px - 8px*var(--header-progress));
  padding:calc(8px - 4px*var(--header-progress)) 12px;
  transform:translateY(calc((1 - var(--header-progress))*14px)); /* ▲ smaller shift */
  will-change:transform;transition:all .3s ease
}
.header:not(.scrolled) .nav-inner{justify-content:center}
.header.scrolled      .nav-inner{justify-content:flex-start}

.nav-item{
  font-size:14px;font-weight:500;letter-spacing:.015em;border-radius:6px;cursor:pointer;
  display:flex;align-items:center;padding:calc(7px - 2px*var(--header-progress)) 14px;transition:all .2s ease
}
.nav-item:hover{background:rgba(0,0,0,.04)}
.nav-item.active,.nav-item.rubriques:hover{background:rgba(0,0,0,.06)}
.nav-item.rubriques{display:flex;gap:4px}

.search-button{display:flex;align-items:center;justify-content:center;padding:4px;border-radius:50%;transition:all .2s ease}
.search-button:hover{background:rgba(0,0,0,.05)}
.search-button svg{width:18px;height:18px}

/* page spacer that shrinks with header */
body{margin-top:calc(140px - 60px*var(--header-progress));transition:margin-top .3s ease}

/* ── mobile tweaks ─────────────────────────────────────── */
@media (max-width:767px){
  .header:not(.scrolled) .header-content{flex-direction:column}
  .header-nav,
  .header.scrolled .header-nav{background:transparent!important}   /* ▲ remove grey on mobile */
  .nav-inner{
    gap:16px;padding:12px 16px;min-width:100%;width:max-content;
    justify-content:flex-start;transform:none                      /* no vertical offset on mobile */
  }
  .nav-item{padding:7px 10px;font-size:13px;flex-shrink:0}
  .brand-title{font-size:28px}
  .brand-logo{height:44px}
  .header.scrolled .brand-logo{height:30px}
  .header.scrolled .brand-title{font-size:24px}
  /* fade on right edge */
  .header-nav::after,.header.scrolled .header-nav::after{
    content:'';position:absolute;top:0;right:0;height:100%;width:24px;
    background:linear-gradient(to left,rgba(255,255,255,.9),rgba(255,255,255,0));pointer-events:none
  }
}

/* misc */
.dropdown-caret{transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
:global(.nav-item:focus-visible),
:global(.dropdown-item:focus-visible){outline:2px solid #3b82f6;outline-offset:2px}
      `}</style>
      <style jsx global>{`
        /* Add margin to body when header becomes scrolled */
        ${isScrolled ? `
        body {
          margin-top: ${isMobile ? '100px' : '80px'};
        }
        ` : `
        body {
          margin-top: ${isMobile ? '120px' : '140px'};
        }
        `}
      `}</style>
    </header>
  );
};

export default Header;