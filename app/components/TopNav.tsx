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
  const { asPath, pathname } = useRouter();
  const [hydratedPath, setHydratedPath] = React.useState<string>("");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setHydratedPath(window.location.pathname || "/");
  }, []);

  const normalizedPath = React.useMemo(() => {
    const rawPath = asPath || pathname || hydratedPath || "/";
    const cleaned = rawPath.split(/[?#]/)[0].replace(/\/+$/, "");
    return cleaned ? cleaned.toLowerCase() : "/";
  }, [asPath, pathname, hydratedPath]);

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
                style={isActive ? { backgroundColor: link.activeColor } : undefined}
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
          width: min(1120px, 100%);
          max-width: 1120px;
          padding: 14px clamp(16px, 4vw, 26px);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(12px, 3vw, 28px);
        }

        .top-nav__logo {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          text-decoration: none;
          min-width: 140px;
          max-width: 220px;
          padding: 4px 0;
        }

        .top-nav__logo img {
          display: block;
          height: 56px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
        }

        .top-nav__links {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(14px, 3vw, 32px);
          flex: 1 1 auto;
        }

        .top-nav__link {
          font-family: "EnbyGertrude", sans-serif;
          font-size: 24px;
          font-weight: 400;
          color: #0f0f0f;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border-radius: 999px;
          transition:
            background-color 0.18s ease,
            color 0.18s ease,
            text-decoration 0.18s ease;
          white-space: nowrap;
          line-height: 1.1;
        }

        .top-nav__link:hover,
        .top-nav__link:focus-visible {
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 6px;
        }

        .top-nav__link--active {
          color: #0f0f0f;
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
            gap: clamp(12px, 4vw, 20px);
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
