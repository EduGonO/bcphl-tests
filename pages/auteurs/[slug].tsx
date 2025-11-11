import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import ArticleGrid from "../../app/components/ArticleGrid";
import Footer from "../../app/components/Footer";
import Portrait from "../../app/components/Portrait";
import RedesignSearchSidebar from "../../app/components/RedesignSearchSidebar";
import TopNav from "../../app/components/TopNav";
import { getArticleData } from "../../lib/articleService";
import { findTeamMemberByName, findTeamMemberBySlug } from "../../lib/team";
import { slugify } from "../../lib/slug";
import type { Article, Category } from "../../types";
import type { TeamMemberWithPortraits } from "../../lib/team";

interface AuthorPageProps {
  authorName: string;
  authorSlug: string;
  authoredArticles: Article[];
  categories: Category[];
  searchArticles: Article[];
  teamMember: TeamMemberWithPortraits | null;
}

const AuthorPage = ({
  authorName,
  authorSlug,
  authoredArticles,
  categories,
  searchArticles,
  teamMember,
}: AuthorPageProps) => {
  const [query, setQuery] = useState("");

  const articleCountLabel = useMemo(() => {
    const count = authoredArticles.length;
    if (count === 0) {
      return "Aucun article";
    }
    return `${count} article${count > 1 ? "s" : ""}`;
  }, [authoredArticles.length]);

  const title = `Bicéphale · ${authorName}`;
  const description = teamMember
    ? `Découvrez le profil de ${authorName} et retrouvez ses articles publiés dans Bicéphale.`
    : `Retrouvez les articles de ${authorName} publiés dans Bicéphale.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div className="page-wrapper" data-author={authorSlug}>
        <TopNav />

        <main className="content">
          <RedesignSearchSidebar
            query={query}
            onQueryChange={setQuery}
            searchLabel="Rechercher dans la revue"
            placeholder="Titre, auteur, mot-clé…"
            articles={searchArticles}
          />

          <div className="author-area">
            <section className="author-hero">
              <div className="author-hero-inner">
                {teamMember && (
                  <div className="portrait-wrapper">
                    <Portrait
                      name={teamMember.name}
                      primarySrc={teamMember.portraits.primary}
                      secondarySrc={teamMember.portraits.secondary}
                      priority
                    />
                  </div>
                )}

                <div className="author-summary">
                  <p className="author-overline">Profil auteur</p>
                  <h1 className="author-name">{authorName}</h1>
                  {teamMember?.role && <p className="author-role">{teamMember.role}</p>}
                  <p className="author-count">{articleCountLabel}</p>

                  <div className="author-bio">
                    {teamMember ? (
                      teamMember.bio.map((paragraph, index) => (
                        <ReactMarkdown
                          key={`${teamMember.slug}-bio-${index}`}
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="bio-paragraph" {...props} />
                            ),
                          }}
                        >
                          {paragraph}
                        </ReactMarkdown>
                      ))
                    ) : (
                      <p className="bio-paragraph">
                        Cette page rassemble toutes les publications de {authorName} sur Bicéphale.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="author-articles">
              <div className="author-articles-inner">
                <ArticleGrid
                  articles={authoredArticles}
                  categories={categories}
                  heading={`Articles de ${authorName}`}
                />
              </div>
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

        .author-area {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .author-hero {
          padding: clamp(40px, 6vw, 80px) clamp(20px, 7vw, 96px);
          background: #f5f0e6;
        }

        .author-hero-inner {
          width: min(920px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: clamp(96px, 24vw, 148px) minmax(0, 1fr);
          align-items: start;
          gap: clamp(18px, 4vw, 36px);
        }

        .portrait-wrapper {
          width: clamp(96px, 24vw, 148px);
          max-width: clamp(96px, 24vw, 148px);
        }

        .portrait-wrapper :global(.portrait) {
          width: 100%;
          aspect-ratio: 3 / 4;
          background: #eae5d9;
        }

        :global(.portrait) {
          position: relative;
          display: block;
          border: none;
          padding: 0;
          background: #eae5d9;
          cursor: pointer;
        }

        :global(.portrait:focus-visible) {
          outline: 2px solid #1f1f1f;
          outline-offset: 4px;
        }

        :global(.portrait-img) {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.35s ease;
        }

        .author-summary {
          display: grid;
          gap: clamp(8px, 2vw, 18px);
          color: #111111;
          max-width: min(620px, 100%);
        }

        .author-overline {
          margin: 0;
          font-size: 14px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-family: "InterRegular", sans-serif;
          color: rgba(17, 17, 17, 0.6);
        }

        .author-name {
          margin: 0;
          font-family: "GayaRegular", serif;
          font-size: clamp(30px, 4.6vw, 48px);
          line-height: 1.08;
          font-weight: 400;
          color: #0d0d0d;
        }

        .author-role {
          margin: -6px 0 0;
          font-family: "InterRegular", sans-serif;
          font-size: 15px;
          color: rgba(17, 17, 17, 0.62);
        }

        .author-count {
          margin: 0;
          font-family: "InterRegular", sans-serif;
          font-size: 14px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(17, 17, 17, 0.52);
        }

        .author-bio {
          display: grid;
          gap: 10px;
          font-family: "InterRegular", sans-serif;
          font-size: 15px;
          line-height: 1.65;
          color: rgba(17, 17, 17, 0.78);
          max-width: 58ch;
        }

        .bio-paragraph {
          margin: 0;
        }

        .author-articles {
          background: #ffffff;
          padding: clamp(44px, 7vw, 80px) clamp(24px, 7vw, 96px) clamp(48px, 9vw, 92px);
          border-top: 1px solid rgba(125, 111, 83, 0.18);
        }

        .author-articles-inner {
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        @media (max-width: 720px) {
          .content {
            flex-direction: column;
          }

          .author-hero {
            padding: clamp(36px, 12vw, 72px) clamp(18px, 8vw, 36px);
          }

          .author-hero-inner {
            grid-template-columns: clamp(88px, 32vw, 124px) minmax(0, 1fr);
            gap: clamp(16px, 6vw, 24px);
          }

          .portrait-wrapper {
            width: clamp(88px, 32vw, 124px);
            max-width: clamp(88px, 32vw, 124px);
          }

          .author-articles {
            padding: clamp(40px, 12vw, 80px) clamp(16px, 8vw, 36px) clamp(64px, 12vw, 96px);
          }

          .author-bio {
            font-size: 16px;
          }
        }

        @media (max-width: 520px) {
          .author-hero-inner {
            grid-template-columns: clamp(84px, 28vw, 112px) minmax(0, 1fr);
          }
        }
      `}</style>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<AuthorPageProps> = async ({
  params,
}) => {
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  if (!slug) {
    return { notFound: true };
  }

  const normalizedSlug = String(slug).toLowerCase();

  const { articles, categories } = await getArticleData();

  const authoredArticles = articles
    .filter((article) => slugify(article.author) === normalizedSlug)
    .sort((a, b) => {
      const timeA = Date.parse(a.date);
      const timeB = Date.parse(b.date);
      const valueA = Number.isNaN(timeA) ? 0 : timeA;
      const valueB = Number.isNaN(timeB) ? 0 : timeB;
      return valueB - valueA;
    });

  if (authoredArticles.length === 0) {
    return { notFound: true };
  }

  const authorName = authoredArticles[0].author;

  const teamMember =
    findTeamMemberBySlug(normalizedSlug) ||
    findTeamMemberByName(authorName) ||
    null;

  return {
    props: {
      authorName,
      authorSlug: normalizedSlug,
      authoredArticles,
      categories,
      searchArticles: articles,
      teamMember,
    },
  };
};

export default AuthorPage;
