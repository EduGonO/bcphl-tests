import Head from "next/head";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { getArticleData } from "../lib/articleService";
import { Article } from "../types";

interface ReflexionPageProps {
  articles: Article[];
}

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

const ReflexionPage = ({ articles }: ReflexionPageProps) => {
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
        // introContent={reflexionIntro}
        columnTitle="RÉFLEXION"
        variant="reflexion"
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
          (article.categorySlug || article.category).toLowerCase() === "reflexion"
      ),
    },
  };
}

export default ReflexionPage;
