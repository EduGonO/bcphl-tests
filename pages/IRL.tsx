import Head from "next/head";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { getArticleData } from "../lib/articleService";
import { Article } from "../types";

interface IRLPageProps {
  articles: Article[];
}

const IRLPage = ({ articles }: IRLPageProps) => {
  return (
    <>
      <Head>
        <title>Bicéphale · IRL</title>
        <meta
          name="description"
          content="Retrouvez tous les articles de la rubrique IRL du magazine Bicéphale."
        />
      </Head>
      <CategoryLandingPage
        articles={articles}
        columnTitle="IRL"
        variant="irl"
      />
    </>
  );
};

export async function getStaticProps() {
  const { articles } = getArticleData();
  return {
    props: {
      articles: articles.filter(
        (article) => article.category.toLowerCase() === "irl"
      ),
    },
  };
}

export default IRLPage;
