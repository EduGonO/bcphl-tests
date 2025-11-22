import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const TopNav: React.FC = () => {
  const router = useRouter();
  const currentPath = (router.asPath || router.pathname || "/").split(/[?#]/)[0];

  const isActive = (href: string) =>
    currentPath === href || currentPath.startsWith(`${href}/`);

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__brand" aria-label="Accueil Bicéphale">
          <img src="/logo-rectangle_bicephale_rvb.svg" alt="Bicéphale" />
        </Link>

        <nav className="top-nav__links" aria-label="Navigation principale">
          <Link
            href="/Reflexion"
            aria-current={isActive("/Reflexion") ? "page" : undefined}
            className={`top-nav__link${isActive("/Reflexion") ? " is-active" : ""}`}
          >
            Reflexión
          </Link>
          <Link
            href="/Creation"
            aria-current={isActive("/Creation") ? "page" : undefined}
            className={`top-nav__link${isActive("/Creation") ? " is-active" : ""}`}
          >
            Création
          </Link>
          <Link
            href="/IRL"
            aria-current={isActive("/IRL") ? "page" : undefined}
            className={`top-nav__link${isActive("/IRL") ? " is-active" : ""}`}
          >
            IRL
          </Link>
          <Link
            href="/bios"
            aria-current={isActive("/bios") ? "page" : undefined}
            className={`top-nav__link${isActive("/bios") ? " is-active" : ""}`}
          >
            À propos
          </Link>
        </nav>
      </div>

      <style jsx>{`
        .top-nav {
          position: sticky;
          top: 0;
          z-index: 60;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #b9b0a3;
          display: flex;
          justify-content: center;
        }

        .top-nav__inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 14px 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .top-nav__brand {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .top-nav__brand img {
          display: block;
          height: 48px;
          width: auto;
        }

        .top-nav__links {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: clamp(16px, 4vw, 28px);
          flex-wrap: nowrap;
          white-space: nowrap;
          font-family: "InterMedium", sans-serif;
          font-size: 16px;
        }

        .top-nav__link {
          color: #0d0d0d;
          text-decoration: none;
          padding-bottom: 6px;
          border-bottom: 2px solid transparent;
          transition: color 120ms ease, border-color 120ms ease;
        }

        .top-nav__link:hover,
        .top-nav__link:focus-visible {
          color: #000;
          border-color: currentColor;
        }

        .top-nav__link.is-active {
          border-color: #000;
          font-family: "InterSemiBold", sans-serif;
        }

        @media (min-width: 768px) {
          .top-nav__inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px 32px;
          }

          .top-nav__brand {
            justify-content: flex-start;
          }

          .top-nav__links {
            justify-content: flex-start;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
