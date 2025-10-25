import Link from "next/link";

import { NAV_LINKS } from "../../config/navLinks";

const TopNav = () => {
  return (
    <header className="top-nav">
      <Link href="/" className="brand" aria-label="Accueil Bicéphale">
        <span className="brand-visual">
          <img src="/media/logo.png" alt="Bicéphale" className="brand-logo" />
        </span>
        <span className="brand-name">Bicéphale</span>
      </Link>
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
      <style jsx>{`
        .top-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 26px 48px 18px;
          border-bottom: 1px solid #b9b0a3;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .brand {
          display: inline-flex;
          flex-direction: row;
          align-items: center;
          gap: 14px;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d0d0d;
          text-decoration: none;
        }
        .brand-visual {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .brand:visited,
        .brand:hover,
        .brand:focus-visible {
          color: #0d0d0d;
        }
        .brand-logo {
          display: block;
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          object-fit: contain;
        }
        .brand-name {
          display: inline-flex;
          align-items: center;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d0d0d;
          line-height: 1;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
          font-family: "InterMedium", sans-serif;
          font-size: 16px;
          text-transform: uppercase;
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
        @media (max-width: 720px) {
          .top-nav {
            padding: 16px 20px;
            flex-direction: column;
            gap: 12px;
          }
          .nav-links {
            flex-wrap: wrap;
            justify-content: center;
            gap: 16px;
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
