import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import styles from "./TopNav.module.css";

const normalizePath = (raw: string) => {
  const cleaned = raw.split(/[?#]/)[0].replace(/\/+$/, "");
  return cleaned ? cleaned.toLowerCase() : "/";
};

const NAV_LINKS = [
  {
    label: "Réflexion",
    href: "/Reflexion",
    activeColor: "#c7b5f4",
  },
  {
    label: "Création",
    href: "/Creation",
    activeColor: "#e8b583",
  },
  {
    label: "IRL",
    href: "/IRL",
    activeColor: "#bdd6c5",
  },
  {
    label: "À propos",
    href: "/bios",
    activeColor: "#d6c6e0",
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
    <header className={styles.topNav} aria-label="Navigation principale">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Accueil Bicéphale">
          <Image
            src="/logo-rectangle_bicephale_rvb.svg"
            alt="Bicéphale"
            className={styles.logoImg}
            width={240}
            height={64}
            priority
            sizes="(max-width: 720px) 70vw, 240px"
          />
        </Link>
        <nav className={styles.links}>
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
                className={`${styles.link}${isActive ? ` ${styles.linkActive}` : ""}`}
                style={{
                  "--accent-color": link.activeColor,
                } as React.CSSProperties}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default TopNav;
