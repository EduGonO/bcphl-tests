import Head from "next/head";
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent as ReactTransitionEvent,
} from "react";
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
  const [renderedSlug, setRenderedSlug] = useState<string | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [bioHeights, setBioHeights] = useState<Record<string, number>>({});
  const bioRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => {
        mediaQuery.removeEventListener("change", updatePreference);
      };
    }

    mediaQuery.addListener(updatePreference);
    return () => {
      mediaQuery.removeListener(updatePreference);
    };
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      setRenderedSlug(selectedSlug);
      setIsAnimatingOut(false);
      setIsAnimatingIn(false);
      return;
    }

    if (!renderedSlug) {
      return;
    }

    if (prefersReducedMotion) {
      setRenderedSlug(null);
      setIsAnimatingOut(false);
      setIsAnimatingIn(false);
      return;
    }

    setIsAnimatingIn(false);
    setIsAnimatingOut(true);
  }, [selectedSlug, renderedSlug, prefersReducedMotion]);

  useEffect(() => {
    if (!renderedSlug) {
      return;
    }

    const bioNode = bioRefs.current.get(renderedSlug);

    if (!bioNode) {
      return;
    }

    const measure = () => {
      const measuredHeight = bioNode.scrollHeight;

      setBioHeights((previous) => {
        if (previous[renderedSlug] === measuredHeight) {
          return previous;
        }

        return {
          ...previous,
          [renderedSlug]: measuredHeight,
        };
      });
    };

    measure();

    if (typeof window === "undefined") {
      return;
    }

    let frame: number | null = null;
    const hasAnimationFrame =
      typeof window.requestAnimationFrame === "function" &&
      typeof window.cancelAnimationFrame === "function";

    const scheduleMeasure = () => {
      if (!hasAnimationFrame) {
        measure();
        return;
      }

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }

      frame = window.requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };

    const handleResize = () => {
      scheduleMeasure();
    };

    window.addEventListener("resize", handleResize);

    let observer: ResizeObserver | null = null;

    if (typeof window.ResizeObserver === "function") {
      observer = new window.ResizeObserver(scheduleMeasure);
      observer.observe(bioNode);
    }

    return () => {
      window.removeEventListener("resize", handleResize);

      if (frame !== null && hasAnimationFrame) {
        window.cancelAnimationFrame(frame);
      }

      if (observer) {
        observer.disconnect();
      }
    };
  }, [renderedSlug]);

  useEffect(() => {
    if (!renderedSlug || renderedSlug !== selectedSlug) {
      return;
    }

    if (prefersReducedMotion) {
      setIsAnimatingIn(true);
      return;
    }

    if (typeof window === "undefined" || typeof window.requestAnimationFrame !== "function") {
      setIsAnimatingIn(true);
      return;
    }

    let rafOne: number | null = null;
    let rafTwo: number | null = null;

    const startEnter = () => {
      setIsAnimatingIn(true);
    };

    rafOne = window.requestAnimationFrame(() => {
      rafTwo = window.requestAnimationFrame(startEnter);
    });

    return () => {
      if (rafOne !== null) {
        window.cancelAnimationFrame(rafOne);
      }
      if (rafTwo !== null) {
        window.cancelAnimationFrame(rafTwo);
      }
      setIsAnimatingIn(false);
    };
  }, [renderedSlug, selectedSlug, prefersReducedMotion]);

  const handleSelectMember = (slug: string) => {
    setSelectedSlug((current) => (current === slug ? null : slug));
  };

  const handleBioTransitionEnd = (
    slug: string,
    event: ReactTransitionEvent<HTMLDivElement>
  ) => {
    if (event.propertyName !== "max-height") {
      return;
    }

    if (isAnimatingOut && renderedSlug === slug) {
      setRenderedSlug(null);
      setIsAnimatingOut(false);
    }
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
                  const shouldRenderBio = renderedSlug === member.slug;
                  const biographyId = `bio-${member.slug}`;
                  const bioState = shouldRenderBio
                    ? isAnimatingOut
                      ? "leaving"
                      : isAnimatingIn
                      ? "entering"
                      : "pre-enter"
                    : null;
                  const measuredHeight = bioHeights[member.slug];
                  const bioStyles: CSSProperties = {};

                  if (!prefersReducedMotion) {
                    if (
                      bioState === "entering" &&
                      typeof measuredHeight === "number"
                    ) {
                      bioStyles.maxHeight = `${measuredHeight}px`;
                    } else if (
                      bioState === "leaving" ||
                      bioState === "pre-enter"
                    ) {
                      bioStyles.maxHeight = "0px";
                    }
                  }

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
                      {shouldRenderBio && (
                        <div
                          className={`member-bio${
                            bioState ? ` is-${bioState}` : ""
                          }`}
                          id={biographyId}
                          role="region"
                          aria-label={`Biographie de ${member.name}`}
                          aria-live="polite"
                          data-state={bioState ?? undefined}
                          ref={(node) => {
                            if (node) {
                              bioRefs.current.set(member.slug, node);
                            } else {
                              bioRefs.current.delete(member.slug);
                            }
                          }}
                          style={bioStyles}
                          onTransitionEnd={(event) =>
                            handleBioTransitionEnd(member.slug, event)
                          }
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
                      )}
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
          font-family: -apple-system, BlinkMacSystemFont, "EnbyGertrude",
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
          font-family: "EnbyGertrude", sans-serif;
        }
        .masthead p {
          margin: 0;
          font-size: clamp(1.05rem, 2vw, 1.25rem);
          line-height: 1.55;
          font-family: -apple-system, BlinkMacSystemFont, "EnbyGertrude",
            "Segoe UI", sans-serif;
          font-weight: 400;
        }
        .team-grid {
          --portrait-grid-gap: clamp(0.65rem, 2.4vw, 1.1rem);
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(clamp(140px, 16vw, 190px), 1fr)
          );
          grid-auto-flow: row dense;
          column-gap: var(--portrait-grid-gap);
          row-gap: var(--portrait-grid-gap);
          align-items: start;
        }
        .member-card {
          display: flex;
          justify-content: center;
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 260ms cubic-bezier(0.22, 1, 0.36, 1);
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
          font-family: "EnbyGertrude", sans-serif;
        }
        .member-bio {
          grid-column: 1 / -1;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transform: translateY(-12px);
          pointer-events: none;
          transition:
            max-height 480ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 320ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: max-height, opacity, transform;
        }
        .member-bio.is-entering {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .member-bio.is-pre-enter {
          pointer-events: none;
        }
        .member-bio.is-leaving {
          opacity: 0;
          transform: translateY(-14px);
          pointer-events: auto;
        }
        .member-bio-inner {
          border: 2px solid #bcb3a3;
          background: rgba(236, 228, 212, 0.55);
          padding: clamp(1.5rem, 3vw, 2.5rem);
          display: grid;
          gap: 0.9rem;
          font-size: 1rem;
          line-height: 1.6;
          font-family: -apple-system, BlinkMacSystemFont, "EnbyGertrude",
            "Segoe UI", sans-serif;
        }
        .member-bio-inner :global(.bio-paragraph) {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "EnbyGertrude",
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
              minmax(clamp(130px, 22vw, 170px), 1fr)
            );
          }
        }
        @media (max-width: 520px) {
          .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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
            max-height: none;
            opacity: 1;
            transform: none;
            pointer-events: auto;
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
