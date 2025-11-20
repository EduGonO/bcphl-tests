import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

import { NAV_LINKS } from "../../config/navLinks";

const TopNav: React.FC = () => {
  const router = useRouter();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth <= 720);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobileViewport) {
      setIsCompact(false);
      return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateCompact = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY + 6 && currentScrollY > 40) {
        setIsCompact(true);
      } else if (currentScrollY < lastScrollY - 6 || currentScrollY <= 40) {
        setIsCompact(false);
      }

      lastScrollY = currentScrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateCompact);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobileViewport]);

  const isCategoriesVisible = !(isMobileViewport && isCompact);
  const normalizedPath = useMemo(() => {
    const path = router.asPath ?? router.pathname;
    const normalized = path.split(/[?#]/)[0].toLowerCase();

    if (normalized.endsWith("/") && normalized !== "/") {
      return normalized.slice(0, -1);
    }

    return normalized;
  }, [router.asPath, router.pathname]);

  return (
    <header
      className={`top-nav${isCompact ? " top-nav--compact" : ""}${
        isMobileViewport ? " top-nav--mobile" : ""
      }`}
    >
      <div className="top-nav__layout">
        <Link href="/" className="brand" aria-label="Accueil Bicéphale">
          <img
            src="/logo-rectangle_bicephale_rvb.svg"
            alt="Bicéphale"
            className="brand-logo brand-logo--wide"
          />
        </Link>
        <div
          className={`top-nav__categories${
            isCategoriesVisible ? "" : " top-nav__categories--hidden"
          }`}
        >
          <nav className="nav-links">
            {NAV_LINKS.map((link) => {
              if (link.disabled) {
                return (
                  <span key={link.label} className="nav-link disabled" aria-disabled="true">
                    {link.label}
                  </span>
                );
              }

              const hrefLower = link.href.toLowerCase();
              const isActive =
                hrefLower === "/"
                  ? normalizedPath === "/"
                  : normalizedPath === hrefLower || normalizedPath.startsWith(`${hrefLower}/`);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`nav-link${isActive ? " nav-link--active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <style jsx>{`
        .top-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 24px 48px 18px;
          border-bottom: 1px solid #b9b0a3;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: padding 0.25s ease;
        }

        .top-nav__layout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          column-gap: 48px;
          width: 100%;
        }

        .brand {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          min-height: 42px;
          block-size: auto;
          flex: 0 1 auto;
          min-width: 0;
          white-space: nowrap;
          box-sizing: border-box;
          padding: 0;
          color: #0d0d0d;
          text-decoration: none;
          line-height: 1;
        }

        .brand:visited,
        .brand:hover,
        .brand:focus-visible {
          color: #0d0d0d;
        }

        .brand-logo {
          display: block;
          flex-shrink: 0;
          height: 42px;
          max-height: 42px;
          width: auto;
          object-fit: contain;
        }

        .brand-logo--wide {
          max-width: min(300px, 45vw);
        }

        .top-nav__categories {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          flex: 0 1 auto;
          min-width: auto;
          transition: opacity 0.25s ease;
          margin-top: 0;
        }

        .top-nav__categories--hidden {
          opacity: 0;
          pointer-events: none;
          margin-top: 0;
        }

        .nav-links {
          display: inline-flex;
          align-items: center;
          gap: 30px;
          font-family: "InterMedium", sans-serif;
          font-size: 16px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .nav-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #111;
          text-decoration: none;
          padding: 6px 0;
          border-bottom: 2px solid transparent;
          transition: color 0.18s ease, border-color 0.18s ease;
        }

        .nav-link:visited {
          color: #111;
        }

        .nav-link:hover,
        .nav-link:focus-visible {
          color: #0a0a0a;
          border-color: currentColor;
        }

        .nav-link--active {
          font-family: "InterSemiBold", sans-serif;
          border-color: #0a0a0a;
          border-bottom-width: 3px;
        }

        .nav-link.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        @media (max-width: 900px) {
          .brand {
            flex: 0 1 220px;
          }
        }

        @media (max-width: 720px) {
          .top-nav {
            padding: 18px 24px 14px;
            gap: 16px;
          }

          .top-nav__layout {
            column-gap: 24px;
            row-gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
          }

          .brand {
            margin: 0 auto;
          }

          .top-nav__categories {
            flex-basis: 100%;
            justify-content: center;
            overflow: hidden;
            max-height: 160px;
            transition: max-height 0.3s ease, opacity 0.25s ease, transform 0.3s ease;
            transform: translateY(0);
            margin-top: 12px;
          }

          .nav-links {
            gap: 20px;
          }

          .top-nav--compact {
            padding: 12px 20px 10px;
            border-bottom-color: rgba(185, 176, 163, 0.6);
          }

          .top-nav__categories--hidden {
            max-height: 0;
            opacity: 0;
            transform: translateY(-8px);
          }

          .top-nav--compact .brand {
            height: 42px;
            min-height: 42px;
          }
        }

        @media (max-width: 420px) {
          .top-nav {
            padding: 16px 18px 10px;
          }

          .brand {
            gap: 10px;
            font-size: 20px;
          }

          .nav-links {
            gap: 16px;
            font-size: 15px;
          }

          .top-nav__session {
            width: 100%;
            justify-content: space-between;
          }

          .top-nav__session {
            flex-wrap: wrap;
            row-gap: 12px;
          }

          .top-nav__signout {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
