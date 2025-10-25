import Head from "next/head";
import { ReactNode } from "react";

import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { getArticleData } from "../lib/articleService";
import { Article } from "../types";

interface ReflexionPageProps {
  articles: Article[];
}

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
        introContent={reflexionIntro}
        columnTitle="Réflexions"
      />
    </>
  );
};

export async function getStaticProps() {
  const { articles } = getArticleData();
  return {
    props: {
      articles: articles.filter(
        (article) => article.category.toLowerCase() === "reflexion"
      ),
    },
  };
}

export default ReflexionPage;
