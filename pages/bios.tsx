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
      <img
        src={primarySrc}
        alt={`Portrait de ${name}`}
        aria-hidden={isAltVisible}
        className="portrait-img primary"
        draggable={false}
        loading={priority ? "eager" : "lazy"}
      />
      <img
        src={secondarySrc}
        alt=""
        aria-hidden={!isAltVisible}
        className="portrait-img secondary"
        draggable={false}
        loading="lazy"
      />
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
          <p className="overline">Bicéphale</p>
          <h1>Équipe éditoriale</h1>
          <p>
            Des personnes qui font vivre la revue, à travers le papier, le son et les rencontres.
            Survolez les portraits pour découvrir une seconde prise.
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
          display: grid;
          gap: clamp(1.25rem, 4vw, 2rem);
          grid-template-columns: minmax(140px, clamp(160px, 18vw, 220px)) 1fr;
          border-top: 2px solid currentColor;
          padding-top: clamp(1.25rem, 3vw, 2rem);
          align-items: start;
        }

        .portrait-wrapper {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          width: min(100%, clamp(140px, 18vw, 220px));
        }

        .portrait {
          display: grid;
          position: relative;
          width: min(100%, clamp(140px, 18vw, 220px));
          border: 2px solid currentColor;
          background: #eae5d9;
          overflow: hidden;
          cursor: pointer;
          padding: 0;
          appearance: none;
          color: inherit;
        }

        .portrait::after {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid rgba(0, 0, 0, 0.1);
          pointer-events: none;
        }

        .portrait:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 4px;
        }

        .portrait-img {
          grid-area: 1 / 1;
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          transition: opacity 180ms ease;
        }

        .portrait-img.secondary {
          opacity: 0;
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
            grid-template-columns: 1fr;
          }

          .portrait-wrapper {
            width: min(100%, clamp(160px, 60vw, 220px));
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
