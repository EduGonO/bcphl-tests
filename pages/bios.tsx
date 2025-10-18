import Head from "next/head";
import Image from "next/image";
import { useCallback, useState } from "react";
import type { PointerEventHandler } from "react";

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
};

const Portrait = ({ name, primarySrc, secondarySrc, priority }: PortraitProps) => {
  const [isAltVisible, setIsAltVisible] = useState(false);

  const showAlt = useCallback(() => setIsAltVisible(true), []);
  const showPrimary = useCallback(() => setIsAltVisible(false), []);

  const handlePointerDown = useCallback<PointerEventHandler<HTMLDivElement>>(
    (event) => {
      if (event.pointerType === "touch" || event.pointerType === "pen") {
        showAlt();
      }
    },
    [showAlt]
  );

  return (
    <div
      className="portrait"
      tabIndex={0}
      aria-label={`Portrait de ${name}`}
      data-alt-visible={isAltVisible || undefined}
      onPointerEnter={showAlt}
      onPointerLeave={showPrimary}
      onPointerDown={handlePointerDown}
      onPointerUp={showPrimary}
      onPointerCancel={showPrimary}
      onFocus={showAlt}
      onBlur={showPrimary}
    >
      <Image
        src={primarySrc}
        alt={`Portrait de ${name}`}
        fill
        className="portrait-img primary"
        sizes="(max-width: 640px) 90vw, (max-width: 1200px) 320px, 360px"
        priority={priority}
      />
      <Image
        src={secondarySrc}
        alt=""
        fill
        aria-hidden
        className="portrait-img secondary"
        sizes="(max-width: 640px) 90vw, (max-width: 1200px) 320px, 360px"
      />
    </div>
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
          {teamMembers.map((member) => (
            <article className="member" key={member.slug}>
              <Portrait
                name={member.name}
                primarySrc={member.portraits.primary}
                secondarySrc={member.portraits.secondary}
                priority={member.slug === "adrien" || member.slug === "anapa"}
              />
              <div className="member-text">
                <div className="member-heading">
                  <h2>{member.name}</h2>
                  {member.role && <p className="role">{member.role}</p>}
                </div>
                {member.bio.map((paragraph, index) => (
                  <p key={`${member.slug}-bio-${index}`}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
      <style jsx>{`
        .bios {
          min-height: 100vh;
          padding: clamp(3.5rem, 6vw, 5.5rem) clamp(1.25rem, 4vw, 2.5rem);
          background: #f7f4ed;
          color: #121212;
          display: grid;
          gap: clamp(3rem, 8vw, 6rem);
        }

        .masthead {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          gap: 1.25rem;
        }

        .overline {
          font-size: 0.85rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
        }

        .masthead h1 {
          margin: 0;
          font-size: clamp(2.4rem, 6vw, 4rem);
          text-transform: uppercase;
          border-bottom: 1px solid currentColor;
          padding-bottom: 1rem;
          max-width: 20ch;
        }

        .masthead p {
          font-size: clamp(1.05rem, 2vw, 1.3rem);
          line-height: 1.6;
          max-width: 60ch;
        }

        .team {
          display: grid;
          gap: clamp(2rem, 5vw, 3.5rem);
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        .member {
          display: grid;
          gap: 1.25rem;
          border-top: 2px solid #121212;
          padding-top: 1.25rem;
        }

        .portrait {
          position: relative;
          aspect-ratio: 3 / 4;
          border: 2px solid #121212;
          background: #e6e1d7;
          overflow: hidden;
          cursor: pointer;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .portrait:focus-visible {
          border-color: #121212;
          box-shadow: 0 0 0 3px rgba(18, 18, 18, 0.2);
        }

        .portrait-img {
          object-fit: cover;
          transition: opacity 0.25s ease;
        }

        .portrait-img.secondary {
          opacity: 0;
        }

        .portrait[data-alt-visible] .portrait-img.secondary,
        .portrait:hover .portrait-img.secondary,
        .portrait:focus-visible .portrait-img.secondary,
        .member:focus-within .portrait-img.secondary {
          opacity: 1;
        }

        .portrait[data-alt-visible] .portrait-img.primary,
        .portrait:hover .portrait-img.primary,
        .portrait:focus-visible .portrait-img.primary,
        .member:focus-within .portrait-img.primary {
          opacity: 0;
        }

        .member-text {
          display: grid;
          gap: 0.75rem;
          font-size: 1rem;
          line-height: 1.6;
        }

        .member-heading {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .member-text h2 {
          margin: 0;
          font-size: clamp(1.7rem, 3vw, 2.2rem);
          text-transform: uppercase;
          letter-spacing: -0.01em;
        }

        .role {
          font-size: 0.9rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        @media (max-width: 600px) {
          .bios {
            padding-top: 3rem;
          }

          .member {
            border-top-width: 1px;
            padding-top: 1rem;
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
