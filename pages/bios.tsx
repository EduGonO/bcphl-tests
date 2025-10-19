import Head from "next/head";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";

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
const hidAlt = useCallback(() => setIsHovered(false), []);
const toggleAlt = useCallback(() => setIsHovered((current) => !current), []);

const loading = priority ? "eager" : "lazy";

return (
<button
type="button"
className={`portrait ${className ?? ""}`.trim()}
aria-label={`Portrait de ${name}`}
onMouseEnter={showAlt}
onMouseLeave={hidAlt}
onFocus={showAlt}
onBlur={hidAlt}
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
return (
<>
<Head>
<title>Bicéphale · L'équipe</title>
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
L’association Brigade d’Interventions Contributives (B.I.C) développe des actions culturelles visant à créer des espaces d’expression artistique transdisciplinaire et de réflexions partagées. Ses interventions incluent l’organisation d’expositions, d’ateliers de médiation culturelle (ateliers d’écriture, collages, etc.), et surtout celle des soirées Bicéphale, un dispositif de cabaret hybride entre performances poétiques, danses, vidéos et musique contemporaine.
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
      width: 100%;
      height: auto;
      aspect-ratio: 3 / 4;
      border: 2px solid currentColor;
      background: #eae5d9;
      overflow: hidden;
      cursor: pointer;
      padding: 0;
      margin: 0;
    }

    .portrait:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 4px;
    }

    .portrait-img {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
    }

    .member-text :global(.bio-paragraph) {
      margin: 0;
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
      .portrait-img {
        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
</>

);
};

export default BiosPage;