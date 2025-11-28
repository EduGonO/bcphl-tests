import Head from "next/head";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { findArticleRecord, getArticleRecords } from "../lib/articleService";
import { getIntroContentFor } from "../lib/introService";
import { Article } from "../types";

interface ReflexionPageProps {
  articles: Article[];
  introHtml: string | null;
  introMarkdown: string | null;
}

type ArticleWithBody = Article & {
  body?: string;
  bodyHtml?: string | null;
  bodyMarkdown?: string;
  content?: string;
  publicBasePath?: string;
  public_path?: string;
};

/*
To restore the introduction section, re-enable the ReactNode import from "react"
and uncomment the block below.
const reflexionIntro: ReactNode = (
  <>
    <p>
      <span className="intro-highlight">Automaton</span> rassemble nos textes de
      réflexion sur les arts, les techniques et les pratiques qui façonnent notre
      rapport au monde.
    </p>
    <p>
      Retrouvez des analyses, essais et prises de position qui prolongent nos
      discussions collectives et invitent à penser autrement les devenirs du
      sensible.
    </p>
  </>
);
*/

const ReflexionPage = ({ articles, introHtml, introMarkdown }: ReflexionPageProps) => {
  return (
    <>
      <Head>
        <title>Bicéphale · Réflexion</title>
        <meta
          name="description"
          content="Textes de réflexion issus de la section Automaton du magazine Bicéphale."
        />
      </Head>
      <CategoryLandingPage
        articles={articles}
        introHtml={introHtml}
        introMarkdown={introMarkdown}
        columnTitle="RÉFLEXION"
        variant="reflexion"
      />
    </>
  );
};

export async function getServerSideProps() {
  const [records, intro] = await Promise.all([
    getArticleRecords(),
    getIntroContentFor("reflexion"),
  ]);

  const categoryRecords = records.filter(
    (record) =>
      (record.article.categorySlug || record.article.category).toLowerCase() ===
      "reflexion"
  );

  const articles: ArticleWithBody[] = await Promise.all(
    categoryRecords.map(async (record) => {
      const hydrated =
        (await findArticleRecord(
          record.article.categorySlug || record.article.category,
          record.article.slug
        )) || record;

      const publicPath = hydrated.publicBasePath || record.publicBasePath || "";

      return {
        ...hydrated.article,
        body: hydrated.body,
        bodyHtml: hydrated.bodyHtml,
        bodyMarkdown: hydrated.body,
        content: hydrated.body,
        publicBasePath: publicPath,
        public_path: publicPath,
      };
    })
  );

  return {
    props: {
      articles,
      introHtml: intro?.html ?? null,
      introMarkdown: intro?.markdown ?? null,
    },
  };
}

export default ReflexionPage;
