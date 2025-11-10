import Head from "next/head";
import type { GetServerSideProps } from "next";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { Article } from "../types";
import { loadPublicContent } from "../lib/supabase/publicContent";

interface IRLPageProps {
  articles: Article[];
  supabaseError?: string | null;
}

const IRLPage = ({ articles, supabaseError }: IRLPageProps) => {
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
        error={supabaseError}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<IRLPageProps> = async () => {
  try {
    const { categories } = await loadPublicContent();
    const irlCategory = categories.find(
      (category) => category.slug?.toLowerCase() === "irl"
    );

    return {
      props: {
        articles: irlCategory ? irlCategory.articles : [],
        supabaseError: null,
      },
    };
  } catch (error) {
    return {
      props: {
        articles: [],
        supabaseError:
          error instanceof Error ? error.message : "Impossible de charger la catégorie IRL.",
      },
    };
  }
};

export default IRLPage;
