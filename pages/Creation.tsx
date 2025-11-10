import Head from "next/head";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { getArticleData } from "../lib/articleService";
import { Article } from "../types";

interface CreationPageProps {
  articles: Article[];
}

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

export async function getStaticProps() {
  const { articles } = await getArticleData();
  return {
    props: {
      articles: articles.filter(
        (article) =>
          (article.categorySlug || article.category).toLowerCase() === "creation"
      ),
    },
  };
}

export default CreationPage;
