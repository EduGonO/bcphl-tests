import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import React from "react";

import { NAV_LINKS } from "../../config/navLinks";

const WORKSPACE_ROUTES = new Set(["/editeur", "/admin", "/master"]);

const TopNav: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isWorkspaceRoute = WORKSPACE_ROUTES.has(router.pathname);
  const canShowSession = status === "authenticated" && isWorkspaceRoute;
  const sessionEmail = session?.user?.email ?? "";

  return (
    <header className="top-nav">
      <Link href="/" className="brand" aria-label="Accueil Bicéphale">
        <span className="brand-visual">
          <img src="/media/logo.png" alt="Bicéphale" className="brand-logo" />
        </span>
        <span className="brand-name">Bicéphale</span>
      </Link>
      <div className="top-nav__right">
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
              <Link key={link.label} href={link.href} className="nav-link">
                {link.label}
              </Link>
            )
          )}
        </nav>
        {canShowSession && (
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
        )}
      </div>
      <style jsx>{`
        .top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
          padding: 24px 48px 18px;
          border-bottom: 1px solid #b9b0a3;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .brand {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 14px;
          height: 42px;
          box-sizing: border-box;
          padding: 0;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d0d0d;
          text-decoration: none;
          line-height: 42px;
        }

        .brand-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          height: 42px;
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
          display: flex;
          align-items: center;
          height: 42px;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d0d0d;
          line-height: 42px;
        }

        .top-nav__right {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
          font-family: "InterMedium", sans-serif;
          font-size: 16px;
          text-transform: uppercase;
          flex-wrap: wrap;
        }

        .nav-link {
          color: #111;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .nav-link:visited {
          color: #111;
        }

        .nav-link:hover,
        .nav-link:focus-visible {
          color: #3a3a3a;
        }

        .nav-link.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
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

        @media (max-width: 1024px) {
          .top-nav {
            padding: 20px 28px 16px;
            gap: 20px;
          }

          .top-nav__right {
            gap: 20px;
            width: 100%;
            justify-content: space-between;
          }

          .nav-links {
            gap: 20px;
            flex: 1;
          }
        }

        @media (max-width: 720px) {
          .top-nav {
            padding: 16px 20px 14px;
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .top-nav__right {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }

          .nav-links {
            justify-content: center;
            gap: 16px;
          }

          .top-nav__session {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 420px) {
          .top-nav__session {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
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
