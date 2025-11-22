import Head from "next/head";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { findArticleRecord, getArticleRecords } from "../lib/articleService";
import { Article } from "../types";

interface IRLPageProps {
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

export async function getServerSideProps() {
  const records = await getArticleRecords();

  const categoryRecords = records.filter(
    (record) =>
      (record.article.categorySlug || record.article.category).toLowerCase() ===
      "irl"
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

export default IRLPage;
