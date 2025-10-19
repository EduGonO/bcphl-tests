import Head from "next/head";
import { useCallback, useState } from "react";

import teamMembersData from "../data/team.json";
import type { TeamMember } from "../types/bios";

type TeamMemberWithPortraits = TeamMember & {
  portraits: {
    primary: string;
    secondary: string;
  };
};

const teamMembers: TeamMemberWithPortraits[] = (teamMembersData as TeamMember[]).map(
  (member) => {
    const base = (member.portraitBase ?? member.slug).toLowerCase();
    return {
      ...member,
      portraits: {
        primary: `/bios/${base}-1.jpg`,
        secondary: `/bios/${base}-2.jpg`,
      },
    };
  }
);

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
  const [isAltVisible, setIsAltVisible] = useState(false);

  const showAlt = useCallback(() => setIsAltVisible(true), []);
  const showPrimary = useCallback(() => setIsAltVisible(false), []);
  const toggleAlt = useCallback(() => {
    setIsAltVisible((current) => !current);
  }, []);

  const loading = priority ? "eager" : "lazy";

  return (
    <button
      type="button"
      className={`portrait ${className ?? ""}`.trim()}
      aria-label={`Portrait de ${name}`}
      data-alt-visible={isAltVisible || undefined}
      onMouseEnter={showAlt}
      onMouseLeave={showPrimary}
      onFocus={showAlt}
      onBlur={showPrimary}
      onClick={toggleAlt}
    >
      <span className="portrait-inner">
        <img
          src={primarySrc}
          alt={`Portrait de ${name}`}
          className={`portrait-img primary${isAltVisible ? "" : " is-visible"}`}
          aria-hidden={isAltVisible}
          draggable={false}
          loading={loading}
          decoding="async"
        />
        <img
          src={secondarySrc}
          alt=""
          className={`portrait-img secondary${isAltVisible ? " is-visible" : ""}`}
          aria-hidden={!isAltVisible}
          draggable={false}
          loading={loading}
          decoding="async"
        />
      </span>
    </button>
  );
};

const BiosPage = () => {
  return (
    <>
      <Head>
        <title>Bicéphale · L&apos;équipe</title>
        <meta
          name="description"
          content="Rencontrez les personnes qui composent Bicéphale et découvrez leurs rôles au sein du magazine."
        />
      </Head>
      <main className="bios">
        <header className="masthead">
          <p className="overline">Membres et Contributeurs - Bicéphale</p>
          <h1>Association BIC - Brigade d’Interventions Contributives</h1>
          <p>
            L’association Brigade d'Interventions Contributives (B.I.C) développe des actions culturelles visant à créer des espaces d'expression artistique transdisciplinaire et de réflexions partagées. Ses interventions incluent l'organisation d'expositions, d'ateliers de médiation culturelle (ateliers d'écriture, collages, etc.), et surtout celle des soirées Bicéphale, un dispositif de cabaret hybride entre performances poétiques, danses, vidéos et musique contemporaine.
          </p>
          <p>
            Toutes ces activités reposent sur l'engagement actif et infaillible de ses adhérents.
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
                  <p key={`${member.slug}-bio-${bioIndex}`}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
      <style jsx>{`
        .bios {
          min-height: 100vh;
          padding: clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 4vw, 3rem);
          background: #f9f7f2;
          color: #1f1f1f;
          display: grid;
          gap: clamp(2.5rem, 7vw, 4.5rem);
        }

        .masthead {
          display: grid;
          gap: 1rem;
          max-width: 720px;
        }

        .overline {
          font-size: 0.85rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .masthead h1 {
          margin: 0;
          font-size: clamp(2.3rem, 7vw, 3.5rem);
          text-transform: uppercase;
        }

        .masthead p {
          margin: 0;
          font-size: clamp(1.05rem, 2vw, 1.25rem);
          line-height: 1.55;
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
          border-top: 2px solid currentColor;
          padding-top: clamp(1.25rem, 3vw, 2rem);
        }

        .portrait-wrapper {
          flex: 0 0 auto;
          width: clamp(120px, 14vw, 160px);
        }

        .portrait {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 3 / 4;
          border: 2px solid currentColor;
          background: #eae5d9;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          appearance: none;
          color: inherit;
        }

        .portrait-inner {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
        }

        .portrait:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }

        .portrait-img {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 180ms ease;
          pointer-events: none;
          opacity: 0;
        }

        .portrait-img.is-visible {
          opacity: 1;
        }

        .portrait[data-alt-visible] .portrait-img.secondary,
        .portrait:hover .portrait-img.secondary,
        .portrait:focus-visible .portrait-img.secondary {
          opacity: 1;
        }

        .portrait[data-alt-visible] .portrait-img.primary,
        .portrait:hover .portrait-img.primary,
        .portrait:focus-visible .portrait-img.primary {
          opacity: 0;
        }

        .member-text {
          flex: 1 1 0;
          display: grid;
          gap: 0.85rem;
          font-size: 1rem;
          line-height: 1.6;
        }

        .member-heading {
          display: grid;
          gap: 0.35rem;
        }

        .member-heading h2 {
          margin: 0;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          text-transform: uppercase;
        }

        .role {
          margin: 0;
          font-size: 0.9rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        @media (max-width: 860px) {
          .member {
            flex-direction: column;
          }

          .portrait-wrapper {
            width: clamp(140px, 45vw, 200px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .portrait,
          .portrait-img {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default BiosPage;
