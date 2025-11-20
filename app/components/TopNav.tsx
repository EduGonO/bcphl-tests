import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

import { NAV_LINKS } from "../../config/navLinks";

const normalizePath = (path: string) => {
  const cleaned = (path || "/").split(/[?#]/)[0];
  if (cleaned === "/") return "/";

  const trimmed = cleaned.replace(/\/+$/, "");
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return withLeadingSlash.toLowerCase();
};

const TopNav: React.FC = () => {
  const router = useRouter();
  const currentPath = useMemo(
    () => normalizePath(router.asPath || router.pathname || "/"),
    [router.asPath, router.pathname],
  );

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__brand" aria-label="Accueil Bicéphale">
          <img src="/logo-rectangle_bicephale_rvb.svg" alt="Bicéphale" />
        </Link>

        <nav className="top-nav__links" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const linkPath = normalizePath(link.href);
            const isActive =
              currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`top-nav__link${isActive ? " is-active" : ""}`}
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
          z-index: 60;
          width: 100%;
          padding: 16px 24px;
          background: #fff;
          border-bottom: 1px solid #b9b0a3;
        }

        .top-nav__inner {
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
          height: 42px;
          width: auto;
        }

        .top-nav__links {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: nowrap;
          font-family: "InterMedium", sans-serif;
          font-size: 16px;
        }

        .top-nav__link {
          color: #0d0d0d;
          text-decoration: none;
          padding-bottom: 6px;
          border-bottom: 2px solid transparent;
          transition: color 0.15s ease, border-color 0.15s ease;
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
          .top-nav {
            padding: 18px 48px;
          }

          .top-nav__inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
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
