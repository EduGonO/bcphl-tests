import Head from "next/head";
import Link from "next/link";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";

import Footer from "../app/components/Footer";
import teamMembersData from "../data/team.json";
import type { TeamMember } from "../types/bios";

type TeamMemberWithPortraits = TeamMember & {
  portraits: {
    primary: string;
    secondary: string;
  };
};

const teamMembers: TeamMemberWithPortraits[] = (teamMembersData as TeamMember[])
  .map((member) => {
    const base = (member.portraitBase ?? member.slug).toLowerCase();
    return {
      ...member,
      portraits: {
        primary: `/bios/${base}-1.jpg`,
        secondary: `/bios/${base}-2.jpg`,
      },
    };
  })
  .sort((a, b) => a.rank - b.rank);

const NAV_LINKS = [
  { label: "Réflexion", href: "/categories/info" },
  { label: "Création", href: "/categories/image-critique" },
  { label: "IRL", href: "/evenements" },
  { label: "À propos", href: "/bios" },
];

type PortraitProps = {
  name: string;
  primarySrc: string;
  secondarySrc: string;
  priority?: boolean;
  className?: string;
};

const Portrait = ({
  name,
  primarySrc,
  secondarySrc,
  priority,
  className,
}: PortraitProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const showAlt = useCallback(() => setIsHovered(true), []);
  const hideAlt = useCallback(() => setIsHovered(false), []);
  const toggleAlt = useCallback(() => setIsHovered((current) => !current), []);

  const loading = priority ? "eager" : "lazy";

  return (
    <button
      type="button"
      className={`portrait ${className ?? ""}`.trim()}
      aria-label={`Portrait de ${name}`}
      onMouseEnter={showAlt}
      onMouseLeave={hideAlt}
      onFocus={showAlt}
      onBlur={hideAlt}
      onClick={toggleAlt}
    >
      <img
        src={primarySrc}
        alt={`Portrait de ${name}`}
        className="portrait-img primary"
        style={{ opacity: isHovered ? 0 : 1 }}
        draggable={false}
        loading={loading}
        decoding="async"
      />
      <img
        src={secondarySrc}
        alt=""
        className="portrait-img secondary"
        style={{ opacity: isHovered ? 1 : 0 }}
        aria-hidden="true"
        draggable={false}
        loading={loading}
        decoding="async"
      />
    </button>
  );
};

const BiosPage = () => {
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Bicéphale · L'équipe</title>
        <meta
          name="description"
          content="Rencontrez les personnes qui composent Bicéphale et découvrez leurs rôles au sein du magazine."
        />
      </Head>
      <div className="page-wrapper">
        <header className="top-nav">
          <div className="brand">
            <img src="/media/logo.png" alt="Bicéphale" className="brand-logo" />
            <span className="brand-name">Bicéphale</span>
          </div>
          <nav className="nav-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="content">
          <aside className={`search-drawer ${drawerOpen ? "open" : ""}`}>
            <div className={`drawer-section ${drawerOpen ? "open" : ""}`}>
              <button
                type="button"
                className="drawer-toggle"
                onClick={() => {
                  setDrawerOpen(true);
                }}
                aria-expanded={drawerOpen}
                aria-controls="search-panel"
                tabIndex={drawerOpen ? -1 : 0}
                aria-hidden={drawerOpen}
              >
                <span>Recherche</span>
              </button>
              <div
                className="drawer-body"
                id="search-panel"
                aria-hidden={!drawerOpen}
              >
                <div className="drawer-header">
                  <h3>Recherche</h3>
                  <button
                    type="button"
                    className="drawer-close"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Réduire la recherche"
                  >
                    Fermer
                  </button>
                </div>
                <label className="drawer-label" htmlFor="search-input">
                  Recherchez un article
                </label>
                <input
                  id="search-input"
                  className="drawer-input"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Titre, auteur, mot-clé..."
                  tabIndex={drawerOpen ? 0 : -1}
                />
                {query && (
                  <button
                    type="button"
                    className="clear-button"
                    onClick={() => setQuery("")}
                    tabIndex={drawerOpen ? 0 : -1}
                  >
                    Effacer
                  </button>
                )}
              </div>
            </div>
            <div className={`drawer-section ${drawerOpen ? "open" : ""}`}>
              <button
                type="button"
                className="drawer-toggle"
                onClick={() => {
                  setDrawerOpen(true);
                }}
                aria-expanded={drawerOpen}
                aria-controls="newsletter-panel"
                tabIndex={drawerOpen ? -1 : 0}
                aria-hidden={drawerOpen}
              >
                <span>Newsletter</span>
              </button>
              <div
                className="drawer-body drawer-body-newsletter"
                id="newsletter-panel"
                aria-hidden={!drawerOpen}
              >
                <div className="drawer-header">
                  <h3>Newsletter</h3>
                  <button
                    type="button"
                    className="drawer-close"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Réduire la newsletter"
                  >
                    Fermer
                  </button>
                </div>
                <p className="drawer-text">
                  Recevez nos actualités, publications et rendez-vous directement
                  par e-mail.
                </p>
                <Link
                  href="/newsletter"
                  className="drawer-newsletter-button"
                  tabIndex={drawerOpen ? 0 : -1}
                >
                  S&rsquo;inscrire à la newsletter
                </Link>
              </div>
            </div>
          </aside>

          <div className="main-area">
            <section className="bios" aria-label="Membres et Contributeurs - Bicéphale">
              <header className="masthead">
                <p className="overline">Membres et Contributeurs - Bicéphale</p>
                <p>
                  L’association Brigade d’Interventions Contributives (B.I.C) développe des actions culturelles visant à créer des
                  espaces d’expression artistique transdisciplinaire et de réflexions partagées. Ses interventions incluent l’organisation
                  d’expositions, d’ateliers de médiation culturelle (ateliers d’écriture, collages, etc.), et surtout celle des soirées
                  Bicéphale, un dispositif de cabaret hybride entre performances poétiques, danses, vidéos et musique contemporaine.
                </p>
                <p>
                  Toutes ces activités reposent sur l’engagement actif et infaillible de ses adhérents.
                </p>
              </header>
              <section className="team" aria-label="Membres de l&apos;équipe Bicéphale">
                {teamMembers.map((member, index) => (
                  <article className="member" key={member.slug}>
                    <div className="portrait-wrapper">
                      <Portrait
                        name={member.name}
                        primarySrc={member.portraits.primary}
                        secondarySrc={member.portraits.secondary}
                        priority={index < 2}
                      />
                    </div>
                    <div className="member-text">
                      <header className="member-heading">
                        <h2>{member.name}</h2>
                        {member.role && <p className="role">{member.role}</p>}
                      </header>
                      {member.bio.map((paragraph, bioIndex) => (
                        <ReactMarkdown
                          key={`${member.slug}-bio-${bioIndex}`}
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="bio-paragraph" {...props} />
                            ),
                          }}
                        >
                          {paragraph}
                        </ReactMarkdown>
                      ))}
                    </div>
                  </article>
                ))}
              </section>
            </section>
          </div>
        </main>

        <Footer footerColor="#0c0c0c" />
      </div>

      <style jsx>{`
        :global(body) {
          background: #ffffff;
        }
        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }
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
          display: flex;
          align-items: center;
          gap: 14px;
          font-family: "GayaRegular", serif;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d0d0d;
          font-weight: 400;
        }
        .brand-logo {
          width: 46px;
          height: 46px;
          object-fit: contain;
        }
        .brand-name {
          color: #0d0d0d;
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
        }
        .nav-link:hover,
        .nav-link:focus-visible {
          color: #3a3a3a;
        }
        .content {
          flex: 1;
          display: flex;
          background: #ffffff;
        }
        .search-drawer {
          position: relative;
          flex: 0 0 auto;
          width: 72px;
          align-self: stretch;
          background: #efdae0;
          border-right: 1px solid #c3aeb6;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.3s ease, max-height 0.3s ease;
          min-height: 100%;
          box-sizing: border-box;
        }
        .search-drawer.open {
          width: 320px;
        }
        .drawer-section {
          position: relative;
          display: grid;
          grid-template-rows: minmax(0, 1fr);
          align-content: start;
          overflow: hidden;
          background: #efdae0;
        }
        .drawer-section.open {
          background: #f5e7ea;
        }
        .drawer-section + .drawer-section {
          border-top: 1px solid rgba(17, 17, 17, 0.18);
          margin-top: -1px;
        }
        .drawer-toggle {
          position: relative;
          z-index: 2;
          background: none;
          border: none;
          border-bottom: 1px solid rgba(17, 17, 17, 0.18);
          cursor: pointer;
          text-transform: uppercase;
          font-family: "InterMedium", sans-serif;
          font-size: 15px;
          letter-spacing: 0.12em;
          padding: 24px 0 16px;
          color: #0d0d0d;
          transition: opacity 0.3s ease, transform 0.3s ease;
          grid-area: 1 / 1;
          align-self: start;
          justify-self: stretch;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 204px;
          width: 100%;
          min-width: 0;
        }
        .drawer-toggle span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          line-height: 1;
          letter-spacing: 0.12em;
        }
        .drawer-section.open .drawer-toggle {
          opacity: 0;
          transform: translateX(-12px);
          pointer-events: none;
        }
        .drawer-body {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 28px 26px 32px;
          background: #f5e7ea;
          border-top: 1px solid rgba(17, 17, 17, 0.16);
          opacity: 0;
          transform: translateX(-24px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          pointer-events: none;
          grid-area: 1 / 1;
          align-self: start;
        }
        .drawer-section.open .drawer-body {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }
        .drawer-body-newsletter {
          gap: 20px;
        }
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .drawer-body h3 {
          margin: 0;
          text-transform: uppercase;
          font-family: "GayaRegular", serif;
          letter-spacing: 0.14em;
          font-size: 18px;
          color: #2c1c23;
        }
        .drawer-close {
          background: none;
          border: 1px solid rgba(44, 28, 35, 0.4);
          text-transform: uppercase;
          font-family: "InterMedium", sans-serif;
          letter-spacing: 0.12em;
          font-size: 11px;
          padding: 6px 16px;
          cursor: pointer;
          color: #2c1c23;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .drawer-close:hover,
        .drawer-close:focus-visible {
          background: #2c1c23;
          color: #fff7fa;
        }
        .drawer-label {
          font-size: 14px;
          font-family: "InterRegular", sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #5b3f47;
        }
        .drawer-input {
          background: #fff7fa;
          border: 1px solid #bfa9b2;
          padding: 12px;
          font-size: 16px;
          font-family: "InterRegular", sans-serif;
        }
        .clear-button {
          align-self: flex-start;
          background: #fff7fa;
          border: 1px solid #bfa9b2;
          padding: 6px 18px;
          text-transform: uppercase;
          font-size: 13px;
          font-family: "InterMedium", sans-serif;
          cursor: pointer;
          color: #2c1c23;
        }
        .clear-button:hover,
        .clear-button:focus-visible {
          background: #2c1c23;
          color: #fff7fa;
        }
        .drawer-text {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          font-family: "InterRegular", sans-serif;
          color: #3c2b31;
        }
        .drawer-newsletter-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #2c1c23;
          color: #fff7fa;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: "InterMedium", sans-serif;
          font-size: 12px;
          padding: 12px 24px;
          border: 1px solid #2c1c23;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
          text-decoration: none;
          align-self: flex-start;
        }
        .drawer-newsletter-button:hover,
        .drawer-newsletter-button:focus-visible {
          background: transparent;
          color: #2c1c23;
        }
        .main-area {
          flex: 1;
          background: #f9f7f2;
          display: flex;
          justify-content: center;
          padding: clamp(2.5rem, 5vw, 4rem) clamp(2rem, 6vw, 4.5rem);
        }
        .bios {
          width: min(920px, 100%);
          display: grid;
          gap: clamp(2.5rem, 7vw, 4.5rem);
          color: #1f1f1f;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "InterRegular",
            "Segoe UI", sans-serif;
          font-weight: 400;
          font-synthesis: none;
        }
        .masthead {
          display: grid;
          gap: 1rem;
        }
        .overline {
          font-size: 0.85rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          font-family: "InterMedium", sans-serif;
        }
        .masthead p {
          margin: 0;
          font-size: clamp(1.05rem, 2vw, 1.25rem);
          line-height: 1.55;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "InterRegular",
            "Segoe UI", sans-serif;
          font-weight: 400;
        }
        .team {
          display: flex;
          flex-direction: column;
          gap: clamp(2rem, 5vw, 3rem);
        }
        .member {
          display: flex;
          align-items: flex-start;
          gap: clamp(1.5rem, 4vw, 2.5rem);
          border-top: 2px solid #bcb3a3;
          padding-top: clamp(1.25rem, 3vw, 2rem);
        }
        .portrait-wrapper {
          flex: 0 0 auto;
          width: clamp(120px, 14vw, 160px);
        }
        :global(.portrait) {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          border: none;
          background: #eae5d9;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          margin: 0;
        }
        :global(.portrait:focus-visible) {
          outline: 2px solid #2c1c23;
          outline-offset: 4px;
        }
        :global(.portrait-img) {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 180ms ease;
        }
        .member-text {
          flex: 1 1 0;
          display: grid;
          gap: 0.85rem;
          font-size: 1rem;
          line-height: 1.6;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "InterRegular",
            "Segoe UI", sans-serif;
          font-weight: 400;
        }
        .member-text :global(.bio-paragraph) {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "InterRegular",
            "Segoe UI", sans-serif;
          font-weight: 400;
        }
        .member-text :global(.bio-paragraph + .bio-paragraph) {
          margin-top: 0.85rem;
        }
        .member-heading {
          display: grid;
          gap: 0.35rem;
        }
        .member-heading h2 {
          margin: 0;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          text-transform: uppercase;
          font-family: "GayaRegular", serif;
          letter-spacing: 0.04em;
          font-weight: 400;
        }
        .role {
          margin: 0;
          font-size: 0.9rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: "InterMedium", sans-serif;
        }
        @media (max-width: 960px) {
          .top-nav {
            padding: 22px 32px 16px;
          }
          .main-area {
            padding: clamp(2rem, 6vw, 3.5rem) clamp(1.5rem, 6vw, 3rem);
          }
        }
        @media (max-width: 860px) {
          .member {
            flex-direction: column;
          }
          .portrait-wrapper {
            width: clamp(140px, 45vw, 200px);
          }
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
          .content {
            flex-direction: column;
          }
          .search-drawer {
            width: 100%;
            max-height: 148px;
            min-height: auto;
          }
          .search-drawer.open {
            max-height: 640px;
          }
          .drawer-section {
            grid-template-rows: auto;
          }
          .drawer-toggle {
            border-bottom: 1px solid rgba(17, 17, 17, 0.2);
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            min-height: auto;
          }
          .drawer-toggle span {
            writing-mode: horizontal-tb;
            transform: none;
            position: static;
            top: auto;
            bottom: auto;
            left: auto;
          }
          .drawer-section.open .drawer-toggle {
            transform: translateY(-8px);
          }
          .drawer-body {
            border-top: 1px solid rgba(17, 17, 17, 0.16);
            border-left: none;
            opacity: 0;
            transform: translateY(-20px);
          }
          .drawer-section.open .drawer-body {
            transform: translateY(0);
            opacity: 1;
          }
          .drawer-newsletter-button {
            width: 100%;
          }
          .main-area {
            padding: clamp(2rem, 7vw, 3rem) clamp(1.25rem, 7vw, 2.5rem);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .search-drawer,
          .drawer-section,
          .drawer-toggle,
          .drawer-body,
          .drawer-close,
          .drawer-newsletter-button,
          :global(.portrait-img) {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      <style jsx global>{`
        .page-wrapper a {
          color: inherit;
          text-decoration: none;
        }
        .page-wrapper a:visited {
          color: inherit;
        }
      `}</style>
    </>
  );
};

export default BiosPage;
