import Head from "next/head";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { findArticleRecord, getArticleRecords } from "../lib/articleService";
import { Article } from "../types";

interface CreationPageProps {
  articles: Article[];
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
const creationIntro: ReactNode = (
  <>
    <p>
      Dans la section <span className="intro-highlight">Bascule</span>, nous
      partageons des créations originales où les mots et les images se
      rencontrent pour dessiner de nouveaux imaginaires.
    </p>
    <p>
      Explorez les propositions artistiques de nos contributrices et
      contributeurs, et laissez-vous surprendre par des formes qui oscillent
      entre poésie, fiction et expérimentations visuelles.
    </p>
  </>
);
*/

const CreationPage = ({ articles }: CreationPageProps) => {
  return (
    <>
      <Head>
        <title>Bicéphale · Création</title>
        <meta
          name="description"
          content="Créations originales publiées dans la section Bascule du magazine Bicéphale."
        />
      </Head>
      <CategoryLandingPage
        articles={articles}
        // introContent={creationIntro}
        columnTitle="CRÉATION"
        variant="creation"
      />
    </>
  );
};

export async function getServerSideProps() {
  const records = await getArticleRecords();

  const categoryRecords = records.filter(
    (record) =>
      (record.article.categorySlug || record.article.category).toLowerCase() ===
      "creation"
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
    props: { articles },
  };
}

export default CreationPage;
