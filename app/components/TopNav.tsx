import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useMemo, useState } from "react";

import { NAV_LINKS } from "../../config/navLinks";

const WORKSPACE_ROUTES = new Set(["/editeur", "/admin", "/master"]);

const TopNav: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  const isWorkspaceRoute = WORKSPACE_ROUTES.has(router.pathname);
  const canShowSession = status === "authenticated" && isWorkspaceRoute;
  const sessionEmail = session?.user?.email ?? "";

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
    return path.split(/[?#]/)[0].toLowerCase();
  }, [router.asPath, router.pathname]);

  return (
    <header
      className={`top-nav${isCompact ? " top-nav--compact" : ""}${
        isMobileViewport ? " top-nav--mobile" : ""
      }`}
    >
      <div className="top-nav__layout">
        <Link href="/" className="brand" aria-label="Accueil Bicéphale">
          <span className="brand-visual">
            <img src="/media/logo.png" alt="Bicéphale" className="brand-logo" />
          </span>
          <span className="brand-name">Bicéphale</span>
        </Link>
        <div
          className={`top-nav__categories${
            isCategoriesVisible ? "" : " top-nav__categories--hidden"
          }`}
        >
          <nav className="nav-links">
            {NAV_LINKS.map((link) =>
              link.disabled ? (
                <span
                  key={link.label}
                  className="nav-link disabled"
                  aria-disabled="true"
                >
                  {link.label}
                </span>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`nav-link${
                    normalizedPath === link.href.toLowerCase()
                      ? " nav-link--active"
                      : ""
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
      {canShowSession && (
        <div className="top-nav__meta">
          <div className="top-nav__session">
            <div className="top-nav__session-info">
              <span className="top-nav__session-label">Connecté·e</span>
              <span className="top-nav__session-email">{sessionEmail}</span>
            </div>
            <button
              type="button"
              className="top-nav__signout"
              onClick={() => signOut()}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
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
          row-gap: 16px;
          flex-wrap: wrap;
          width: 100%;
        }

        .brand {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          gap: 14px;
          height: 42px;
          min-height: 42px;
          max-height: 42px;
          block-size: 42px;
          min-block-size: 42px;
          max-block-size: 42px;
          flex: 1 1 280px;
          min-width: 0;
          white-space: nowrap;
          box-sizing: border-box;
          padding: 0;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d0d0d;
          text-decoration: none;
          line-height: 1;
        }

        .brand-visual,
        .brand-name {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 42px;
          min-height: 42px;
        }

        .brand-visual {
          flex-direction: row;
          flex-shrink: 0;
          width: 42px;
        }

        .brand:visited,
        .brand:hover,
        .brand:focus-visible {
          color: #0d0d0d;
        }

        .brand-logo {
          display: block;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .brand-name {
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d0d0d;
          line-height: 1;
        }

        .top-nav__categories {
          display: flex;
          justify-content: flex-end;
          flex: 0 1 auto;
          min-width: auto;
          transition: opacity 0.25s ease;
        }

        .top-nav__categories--hidden {
          opacity: 0;
          pointer-events: none;
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
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #111;
          text-decoration: none;
          transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          padding: 8px 16px;
          border-radius: 999px;
        }

        .nav-link:visited {
          color: #111;
        }

        .nav-link:hover,
        .nav-link:focus-visible {
          color: #3a3a3a;
          background: rgba(17, 17, 17, 0.08);
        }

        .nav-link--active {
          font-family: "InterSemiBold", sans-serif;
          color: #111;
          background: rgba(17, 17, 17, 0.12);
          box-shadow: inset 0 0 0 1px rgba(17, 17, 17, 0.08);
        }

        .nav-link.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        .top-nav__meta {
          display: flex;
          width: 100%;
          justify-content: flex-end;
        }

        .top-nav__session {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(24, 25, 32, 0.05);
          border-radius: 16px;
          padding: 12px 18px;
          box-shadow: inset 0 0 0 1px rgba(24, 25, 32, 0.04);
        }

        .top-nav__session-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 220px;
        }

        .top-nav__session-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #7b7d86;
        }

        .top-nav__session-email {
          font-size: 13px;
          color: #181920;
          font-weight: 600;
          word-break: break-word;
        }

        .top-nav__signout {
          border: none;
          background: #181920;
          color: #ffffff;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          border-radius: 999px;
          padding: 9px 20px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }

        .top-nav__signout:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(24, 25, 32, 0.18);
        }

        @media (max-width: 1100px) {
          .top-nav__categories {
            flex-basis: 100%;
            justify-content: flex-start;
          }

          .nav-links {
            gap: 24px;
          }
        }

        @media (max-width: 900px) {
          .brand {
            flex: 1 1 220px;
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
          }

          .top-nav__categories {
            flex-basis: 100%;
            justify-content: center;
            overflow: hidden;
            max-height: 160px;
            transition: max-height 0.3s ease, opacity 0.25s ease, transform 0.3s ease;
            transform: translateY(0);
          }

          .nav-links {
            gap: 20px;
          }

          .top-nav__meta {
            justify-content: flex-start;
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
      <style jsx global>{`
        .top-nav .brand,
        .top-nav .brand:visited,
        .top-nav .brand:hover,
        .top-nav .brand:focus-visible,
        .top-nav .brand:active,
        .top-nav .nav-link,
        .top-nav .nav-link:visited,
        .top-nav .nav-link:hover,
        .top-nav .nav-link:focus-visible,
        .top-nav .nav-link:active {
          color: #0d0d0d;
          text-decoration: none;
        }
      `}</style>
    </header>
  );
};

export default TopNav;
