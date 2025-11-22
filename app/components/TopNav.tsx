import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

const NAV_LINKS = [
  { label: "Réflexion", href: "/Reflexion" },
  { label: "Création", href: "/Creation" },
  { label: "IRL", href: "/IRL" },
  { label: "À propos", href: "/bios" },
];

const TopNav: React.FC = () => {
  const { asPath } = useRouter();

  const normalizedPath = useMemo(() => {
    const path = (asPath || "/").split(/[?#]/)[0].toLowerCase();
    if (path !== "/" && path.endsWith("/")) {
      return path.slice(0, -1);
    }
    return path;
  }, [asPath]);

  return (
    <header className="top-nav" aria-label="Navigation principale">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__logo" aria-label="Accueil Bicéphale">
          <img src="/logo-rectangle_bicephale_rvb.svg" alt="Bicéphale" />
        </Link>
        <nav className="top-nav__links">
          {NAV_LINKS.map((link) => {
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
                className={`top-nav__link${isActive ? " top-nav__link--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <style jsx>{`
        .top-nav {
          position: sticky;
          top: 0;
          z-index: 10;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #b9b0a3;
          padding: 16px 20px;
        }

        .top-nav__inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          width: 100%;
        }

        .top-nav__logo {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          text-decoration: none;
        }

        .top-nav__logo img {
          height: 48px;
          width: auto;
          display: block;
        }

        .top-nav__links {
          display: flex;
          flex: 1;
          justify-content: space-evenly;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .top-nav__link {
          font-family: "EnbyGertrude", sans-serif;
          font-size: 24px;
          font-weight: 400;
          color: #0f0f0f;
          text-decoration: none;
          padding: 10px 18px;
          border-radius: 999px;
          transition: background-color 0.15s ease, color 0.15s ease, text-decoration 0.15s ease;
          white-space: nowrap;
        }

        .top-nav__link:hover,
        .top-nav__link:focus-visible {
          text-decoration: underline;
        }

        .top-nav__link--active {
          background-color: #d7c6a4;
        }

        @media (max-width: 720px) {
          .top-nav__inner {
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }

          .top-nav__logo {
            justify-content: center;
          }

          .top-nav__links {
            width: 100%;
            justify-content: space-evenly;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
