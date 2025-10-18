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
      <main className="bios-page">
        <header className="intro">
          <p className="eyebrow">Bicéphale</p>
          <h1>Celles et ceux qui tiennent la revue debout</h1>
          <p>
            Chaque portrait est présenté dans un cadre façon Polaroid. Survolez ou touchez
            les images pour révéler un second cliché, capturé dans les coulisses du magazine.
          </p>
        </header>
        <section className="team-grid" aria-label="Membres de l&apos;équipe Bicéphale">
          {teamMembers.map((member) => (
            <article className="team-card" key={member.slug}>
              <div className="polaroid" tabIndex={0} aria-label={`Portrait de ${member.name}`}>
                <div className="photo">
                  <Image
                    src={member.portraits.primary}
                    alt={`Portrait de ${member.name}`}
                    fill
                    className="photo-image primary"
                    sizes="(max-width: 600px) 80vw, (max-width: 1200px) 320px, 360px"
                    priority={member.slug === "adrien" || member.slug === "anapa"}
                  />
                  <Image
                    src={member.portraits.secondary}
                    alt=""
                    fill
                    aria-hidden
                    className="photo-image secondary"
                    sizes="(max-width: 600px) 80vw, (max-width: 1200px) 320px, 360px"
                  />
                </div>
                <span className="frame-label">{member.name}</span>
              </div>
              <div className="bio">
                <h2>{member.name}</h2>
                {member.role && <p className="role">{member.role}</p>}
                {member.bio.map((paragraph, index) => (
                  <p key={`${member.slug}-bio-${index}`}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </main>
      <style jsx>{`
        .bios-page {
          padding: 6rem 1.5rem 4rem;
          background: radial-gradient(circle at 10% 10%, rgba(255, 214, 228, 0.35), transparent 50%),
            radial-gradient(circle at 90% 15%, rgba(209, 233, 255, 0.35), transparent 55%),
            #f7f3ef;
          min-height: 100vh;
          color: #261e1e;
          display: grid;
          gap: 3rem;
        }

        .intro {
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
          display: grid;
          gap: 1.25rem;
        }

        .intro h1 {
          font-family: "GayaRegular", serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          letter-spacing: 0.01em;
        }

        .intro p {
          font-size: 1rem;
          line-height: 1.7;
          color: rgba(38, 30, 30, 0.78);
        }

        .intro .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-size: 0.75rem;
          font-weight: 600;
          color: rgba(38, 30, 30, 0.6);
        }

        .team-grid {
          display: grid;
          gap: 2.5rem;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          align-items: start;
        }

        .team-card {
          display: grid;
          gap: 1.4rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 18px;
          padding: 1.6rem 1.6rem 1.8rem;
          box-shadow: 0 18px 40px rgba(14, 8, 6, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.4);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }

        .team-card:focus-within,
        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 26px 60px rgba(14, 8, 6, 0.16);
        }

        .polaroid {
          position: relative;
          background: #fff;
          border-radius: 14px;
          padding: 1.1rem 1.1rem 2.9rem;
          box-shadow: 0 18px 28px rgba(22, 13, 9, 0.18);
          display: grid;
          gap: 0.75rem;
          outline: none;
          cursor: pointer;
        }

        .polaroid:focus-visible {
          box-shadow: 0 0 0 4px rgba(77, 130, 255, 0.4), 0 18px 28px rgba(22, 13, 9, 0.18);
        }

        .photo {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 8px;
          background: #f2f2f2;
        }

        .photo-image {
          object-fit: cover;
          transition: opacity 0.45s ease;
        }

        .photo-image.secondary {
          opacity: 0;
        }

        .team-card:hover .photo-image.secondary,
        .team-card:focus-within .photo-image.secondary,
        .polaroid:focus-visible .photo-image.secondary,
        .polaroid:hover .photo-image.secondary {
          opacity: 1;
        }

        .team-card:hover .photo-image.primary,
        .team-card:focus-within .photo-image.primary,
        .polaroid:focus-visible .photo-image.primary,
        .polaroid:hover .photo-image.primary {
          opacity: 0;
        }

        .frame-label {
          position: absolute;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.78rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(38, 30, 30, 0.55);
        }

        .bio {
          display: grid;
          gap: 0.75rem;
          font-size: 0.95rem;
          line-height: 1.7;
          color: rgba(38, 30, 30, 0.82);
        }

        .bio h2 {
          font-family: "GayaRegular", serif;
          font-size: 1.4rem;
          margin: 0;
        }

        .role {
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: rgba(38, 30, 30, 0.6);
        }

        @media (prefers-reduced-motion: reduce) {
          .team-card,
          .photo-image {
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 640px) {
          .bios-page {
            padding-top: 4.5rem;
          }

          .team-card {
            padding: 1.2rem 1.2rem 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default BiosPage;
