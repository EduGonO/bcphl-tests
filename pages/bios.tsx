import Head from "next/head";
import Image from "next/image";

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
              <div
                className="portrait"
                tabIndex={0}
                aria-label={`Portrait de ${member.name}`}
              >
                <Image
                  src={member.portraits.primary}
                  alt={`Portrait de ${member.name}`}
                  fill
                  className="portrait-img primary"
                  sizes="(max-width: 600px) 90vw, (max-width: 1200px) 320px, 360px"
                  priority={member.slug === "adrien" || member.slug === "anapa"}
                />
                <Image
                  src={member.portraits.secondary}
                  alt=""
                  fill
                  aria-hidden
                  className="portrait-img secondary"
                  sizes="(max-width: 600px) 90vw, (max-width: 1200px) 320px, 360px"
                />
              </div>
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
          padding: clamp(4rem, 6vw, 6.5rem) 1.75rem clamp(4rem, 8vw, 7rem);
          background: #f6f2e9;
          color: #111;
          display: grid;
          gap: clamp(3rem, 7vw, 5.5rem);
        }

        .masthead {
          max-width: 960px;
          margin: 0 auto;
          display: grid;
          gap: 1.5rem;
          text-align: left;
        }

        .overline {
          font-size: 0.9rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .masthead h1 {
          font-size: clamp(2.5rem, 7vw, 4.5rem);
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.02;
          padding-bottom: 1.1rem;
          border-bottom: 3px solid #111;
          max-width: 18ch;
        }

        .masthead p {
          font-size: clamp(1rem, 2.2vw, 1.35rem);
          line-height: 1.6;
          max-width: 52ch;
        }

        .team {
          display: grid;
          gap: clamp(2.5rem, 5vw, 3.75rem);
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .member {
          background: #faf9f5;
          border: 2px solid #111;
          padding: 1.5rem;
          display: grid;
          gap: 1.5rem;
          box-shadow: 10px 10px 0 #111;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .member:focus-within,
        .member:hover {
          transform: translate(-6px, -6px);
          box-shadow: 16px 16px 0 #111;
        }

        .portrait {
          position: relative;
          aspect-ratio: 3 / 4;
          border: 2px solid #111;
          overflow: hidden;
          background: #dcd8cf;
          cursor: pointer;
          outline: none;
        }

        .portrait:focus-visible {
          box-shadow: 0 0 0 3px #111;
        }

        .portrait-img {
          object-fit: cover;
          transition: opacity 0.25s ease;
        }

        .portrait-img.secondary {
          opacity: 0;
        }

        .portrait:hover .portrait-img.secondary,
        .portrait:focus-visible .portrait-img.secondary,
        .member:focus-within .portrait-img.secondary {
          opacity: 1;
        }

        .portrait:hover .portrait-img.primary,
        .portrait:focus-visible .portrait-img.primary,
        .member:focus-within .portrait-img.primary {
          opacity: 0;
        }

        .member-text {
          display: grid;
          gap: 1rem;
          font-size: 1rem;
          line-height: 1.65;
        }

        .member-heading {
          display: grid;
          gap: 0.3rem;
        }

        .member-text h2 {
          margin: 0;
          font-size: clamp(1.8rem, 3vw, 2.2rem);
          line-height: 1.05;
          text-transform: uppercase;
        }

        .role {
          font-size: 0.95rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        @media (max-width: 600px) {
          .member {
            padding: 1.25rem;
            box-shadow: 6px 6px 0 #111;
          }

          .member:hover,
          .member:focus-within {
            transform: none;
            box-shadow: 6px 6px 0 #111;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .member,
          .portrait-img {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};

export default BiosPage;
