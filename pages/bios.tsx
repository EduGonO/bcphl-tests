import Head from "next/head";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";

import Footer from "../app/components/Footer";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
import TopNav from "../app/components/TopNav";
import { getArticleData } from "../lib/articleService";
import teamMembersData from "../data/team.json";
import { Article } from "../types";
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

type PortraitProps = {
  name: string;
  primarySrc: string;
  secondarySrc: string;
  priority?: boolean;
  className?: string;
};

interface BiosPageProps {
  articles: Article[];
}

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

const BiosPage = ({ articles }: BiosPageProps) => {
  const [query, setQuery] = useState("");
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
          .content {
            flex-direction: column;
          }
          .main-area {
            padding: clamp(2rem, 7vw, 3rem) clamp(1.25rem, 7vw, 2.5rem);
          }
        }
        @media (prefers-reduced-motion: reduce) {
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
        .page-wrapper .footer {
          margin-top: 0;
        }
      `}</style>
    </>
  );
};

export async function getStaticProps() {
  const { articles } = await getArticleData();
  return {
    props: {
      articles,
    },
  };
}

export default BiosPage;
