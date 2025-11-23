import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const toRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const intVal = parseInt(full, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const normalizePath = (raw: string) => {
  const cleaned = raw.split(/[?#]/)[0].replace(/\/+$/, "");
  return cleaned ? cleaned.toLowerCase() : "/";
};

const NAV_LINKS = [
  {
    label: "Réflexion",
    href: "/Reflexion",
    activeColor: "#c7b5f4",
    hoverColor: toRgba("#c7b5f4", 0.5),
  },
  {
    label: "Création",
    href: "/Creation",
    activeColor: "#e8b583",
    hoverColor: toRgba("#e8b583", 0.5),
  },
  {
    label: "IRL",
    href: "/IRL",
    activeColor: "#bdd6c5",
    hoverColor: toRgba("#bdd6c5", 0.5),
  },
  {
    label: "À propos",
    href: "/bios",
    activeColor: "#d6c6e0",
    hoverColor: toRgba("#d6c6e0", 0.5),
  },
];

const TopNav: React.FC = () => {
  const router = useRouter();
  const getCurrentPath = React.useCallback(
    (value?: string) => {
      if (value) return normalizePath(value);
      if (router.asPath) return normalizePath(router.asPath);
      if (router.pathname) return normalizePath(router.pathname);
      if (typeof window !== "undefined" && window.location?.pathname) {
        return normalizePath(window.location.pathname);
      }
      return "/";
    },
    [router.asPath, router.pathname]
  );

  const [currentPath, setCurrentPath] = React.useState<string>(() => {
    if (typeof window !== "undefined" && window.location?.pathname) {
      return normalizePath(window.location.pathname);
    }
    return getCurrentPath();
  });

  React.useEffect(() => {
    if (!router.isReady) return;

    const handleRouteChange = (url?: string) => setCurrentPath(getCurrentPath(url));

    handleRouteChange(router.asPath);

    router.events?.on("routeChangeComplete", handleRouteChange);
    router.events?.on("hashChangeComplete", handleRouteChange);

    return () => {
      router.events?.off("routeChangeComplete", handleRouteChange);
      router.events?.off("hashChangeComplete", handleRouteChange);
    };
  }, [getCurrentPath, router.asPath, router.events, router.isReady]);

  return (
    <header className="top-nav" aria-label="Navigation principale">
      <div className="top-nav__inner">
        <Link href="/" className="top-nav__logo" aria-label="Accueil Bicéphale">
          <Image
            src="/logo-rectangle_bicephale_rvb.svg"
            alt="Bicéphale"
            className="top-nav__logo-img"
            width={240}
            height={64}
            priority
            sizes="(max-width: 720px) 70vw, 240px"
          />
        </Link>
        <nav className="top-nav__links">
          {NAV_LINKS.map((link) => {
            const hrefLower = link.href.toLowerCase();
            const isActive =
              hrefLower === "/"
                ? currentPath === "/"
                : currentPath === hrefLower || currentPath.startsWith(`${hrefLower}/`);

            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`top-nav__link${isActive ? " top-nav__link--active" : ""}`}
                style={{
                  "--active-color": link.activeColor,
                  "--hover-color": link.hoverColor,
                } as React.CSSProperties}
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
          width: min(1080px, 100%);
          max-width: 1080px;
          padding: 14px clamp(16px, 5vw, 32px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: center;
          column-gap: clamp(36px, 8vw, 64px);
        }

        .top-nav__logo {
          flex: 0 0 auto;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          text-decoration: none;
          width: auto;
          max-width: clamp(180px, 24vw, 240px);
          min-width: 160px;
          padding: 6px 0;
        }

        .top-nav__logo-img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 64px;
          object-fit: contain;
          opacity: 1;
        }

        .top-nav__links {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(18px, 4vw, 36px);
          flex: 1 1 auto;
          flex-wrap: nowrap;
          width: 100%;
          padding-right: clamp(6px, 2vw, 18px);
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
          padding: 12px 22px;
          border-radius: 999px;
          transition:
            color 0.18s ease,
            text-decoration 0.18s ease,
            transform 0.2s ease;
          white-space: nowrap;
          line-height: 1.1;
          background-color: transparent;
          position: relative;
          isolation: isolate;
        }

        .top-nav__link::before {
          content: "";
          position: absolute;
          inset: 6px 8px;
          border-radius: 999px;
          background-color: transparent;
          border: 2px solid var(--active-color, transparent);
          opacity: 1;
          transform: scale(1);
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            opacity 0.2s ease,
            transform 0.2s ease;
          z-index: -1;
          pointer-events: none;
        }

        .top-nav__link:hover,
        .top-nav__link:focus-visible {
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 6px;
        }

        .top-nav__link:hover::before,
        .top-nav__link:focus-visible::before {
          background-color: var(--hover-color, transparent);
          opacity: 1;
          transform: scale(1);
        }

        .top-nav__link--active {
          color: #0f0f0f;
        }

        .top-nav__link--active::before,
        .top-nav__link--active:hover::before,
        .top-nav__link--active:focus-visible::before {
          background-color: var(--active-color, transparent);
          border-color: var(--active-color, transparent);
          opacity: 1;
          transform: scale(1);
        }

        .top-nav__link--active:hover,
        .top-nav__link--active:focus-visible {
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 6px;
        }

        @media (max-width: 720px) {
          .top-nav__inner {
            display: flex;
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

          .top-nav__logo-img {
            height: 56px;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNav;
