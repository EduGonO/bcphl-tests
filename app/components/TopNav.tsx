import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const NAV_LINKS = [
  { label: "Réflexion", href: "/Reflexion", activeColor: "#c7b5f4" },
  { label: "Création", href: "/Creation", activeColor: "#e8b583" },
  { label: "IRL", href: "/IRL", activeColor: "#bdd6c5" },
  { label: "À propos", href: "/bios", activeColor: "#d6c6e0" },
];

const TopNav: React.FC = () => {
  const { asPath } = useRouter();
  const normalizedPath = (asPath || "/")
    .split(/[?#]/)[0]
    .replace(/\/+$/, "")
    .toLowerCase() || "/";

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
                style={
                  isActive
                    ? ({ "--active-color": link.activeColor } as React.CSSProperties)
                    : undefined
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <style jsx>{`
        .top-nav,
        .top-nav * {
          box-sizing: border-box;
        }

        .top-nav {
          position: sticky;
          top: 0;
          z-index: 10;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #b9b0a3;
          display: flex;
          justify-content: center;
        }

        .top-nav__inner {
          width: 100%;
          max-width: 960px;
          padding: 12px clamp(14px, 3vw, 22px);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(10px, 2.6vw, 24px);
        }

        .top-nav__logo {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          text-decoration: none;
          max-width: 100%;
        }

        .top-nav__logo img {
          height: clamp(42px, 5vw, 54px);
          width: auto;
          display: block;
        }

        .top-nav__links {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(12px, 2.6vw, 26px);
          flex: 0 1 auto;
        }

        .top-nav__link {
          font-family: "EnbyGertrude", sans-serif;
          font-size: clamp(18px, 3.4vw, 24px);
          font-weight: 400;
          color: #0f0f0f;
          text-decoration: none;
          padding: clamp(7px, 1.4vw, 9px) clamp(14px, 3vw, 20px);
          border-radius: 999px;
          transition: background-color 0.15s ease, color 0.15s ease,
            text-decoration 0.15s ease, box-shadow 0.2s ease;
          white-space: nowrap;
        }

        .top-nav__link:hover,
        .top-nav__link:focus-visible {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .top-nav__link--active {
          color: #0f0f0f;
          background: var(--active-color);
          border-radius: 18px 18px 20px 20px;
          box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.06),
            0 2px 6px rgba(0, 0, 0, 0.12);
        }

        @media (max-width: 720px) {
          .top-nav__inner {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }

          .top-nav__logo {
            width: 100%;
            justify-content: center;
          }

          .top-nav__links {
            width: 100%;
            justify-content: center;
            gap: clamp(10px, 4vw, 20px);
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
