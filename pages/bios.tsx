import Head from "next/head";
import { Fragment, useState } from "react";
import ReactMarkdown from "react-markdown";

import Footer from "../app/components/Footer";
import Portrait from "../app/components/Portrait";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
import TopNav from "../app/components/TopNav";
import { getArticleData } from "../lib/articleService";
import { Article } from "../types";
import { getTeamMembers } from "../lib/team";

interface BiosPageProps {
  articles: Article[];
}

const teamMembers = getTeamMembers();

const BiosPage = ({ articles }: BiosPageProps) => {
  const [query, setQuery] = useState("");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleSelectMember = (slug: string) => {
    setSelectedSlug((current) => (current === slug ? null : slug));
  };
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
        <TopNav />

        <main className="content">
          <RedesignSearchSidebar
            query={query}
            onQueryChange={setQuery}
            articles={articles}
          />

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
              <section className="team-grid" aria-label="Membres de l&apos;équipe Bicéphale">
                {teamMembers.map((member, index) => {
                  const isSelected = selectedSlug === member.slug;
                  const biographyId = `bio-${member.slug}`;

                  return (
                    <Fragment key={member.slug}>
                      <article className={`member-card${isSelected ? " is-selected" : ""}`}>
                        <div className="portrait-wrapper">
                          <Portrait
                            name={member.name}
                            primarySrc={member.portraits.primary}
                            secondarySrc={member.portraits.secondary}
                            priority={index < 2}
                            onSelect={() => handleSelectMember(member.slug)}
                            ariaExpanded={isSelected}
                            ariaControls={biographyId}
                          />
                        </div>
                      </article>
                      <div
                        className={`member-bio${isSelected ? " open" : ""}`}
                        id={biographyId}
                        role="region"
                        aria-label={`Biographie de ${member.name}`}
                        aria-live={isSelected ? "polite" : undefined}
                        aria-hidden={!isSelected}
                      >
                        <div className="member-bio-inner">
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
                      </div>
                    </Fragment>
                  );
                })}
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
        .content {
          flex: 1;
          display: flex;
          background: #ffffff;
        }
        .main-area {
          flex: 1;
          background: #f9f7f2;
          display: flex;
          justify-content: center;
          padding: clamp(2.5rem, 5vw, 4rem) clamp(2rem, 6vw, 4.5rem);
        }
        .bios {
          width: min(1120px, 100%);
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
        .team-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(clamp(140px, 16vw, 190px), 1fr)
          );
          grid-auto-flow: row dense;
          gap: clamp(1.5rem, 4vw, 2.25rem);
          align-items: start;
        }
        .member-card {
          display: flex;
          justify-content: center;
          transition: transform 180ms ease, filter 180ms ease;
        }
        .member-card.is-selected {
          transform: translateY(-2px);
          filter: drop-shadow(0 10px 24px rgba(28, 22, 19, 0.14));
        }
        .portrait-wrapper {
          width: 100%;
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
        .role {
          margin: 0;
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: "InterMedium", sans-serif;
        }
        .member-bio {
          grid-column: 1 / -1;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          pointer-events: none;
          transition: max-height 260ms ease, opacity 200ms ease, margin 200ms ease;
          margin: 0;
        }
        .member-bio.open {
          max-height: 2000px;
          opacity: 1;
          pointer-events: auto;
          margin: clamp(0.5rem, 2vw, 1rem) 0 0;
        }
        .member-bio-inner {
          border: 2px solid #bcb3a3;
          background: rgba(236, 228, 212, 0.55);
          padding: clamp(1.5rem, 3vw, 2.5rem);
          display: grid;
          gap: 0.9rem;
          font-size: 1rem;
          line-height: 1.6;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "InterRegular",
            "Segoe UI", sans-serif;
        }
        .member-bio-inner :global(.bio-paragraph) {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "InterRegular",
            "Segoe UI", sans-serif;
          font-weight: 400;
        }
        .member-bio-inner :global(.bio-paragraph + .bio-paragraph) {
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
        @media (max-width: 960px) {
          .main-area {
            padding: clamp(2rem, 6vw, 3.5rem) clamp(1.5rem, 6vw, 3rem);
          }
        }
        @media (max-width: 860px) {
          .team-grid {
            grid-template-columns: repeat(
              auto-fit,
              minmax(clamp(130px, 40vw, 180px), 1fr)
            );
          }
        }
        @media (max-width: 720px) {
          .content {
            flex-direction: column;
          }
          .main-area {
            padding: clamp(2rem, 7vw, 3rem) clamp(1.25rem, 7vw, 2.5rem);
          }
          .bios {
            gap: clamp(2rem, 6vw, 3.5rem);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.portrait-img) {
            transition-duration: 0.01ms !important;
          }
          .member-card {
            transition: none;
          }
          .member-bio {
            transition: none;
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
        .page-wrapper .footer {
          margin-top: 0;
        }
      `}</style>
    </>
  );
};

export async function getServerSideProps() {
  const { articles } = await getArticleData();
  return {
    props: {
      articles,
    },
  };
}

export default BiosPage;
