import Head from "next/head";
import type { GetServerSideProps } from "next";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { Article } from "../types";
import { loadPublicContent } from "../lib/supabase/publicContent";

interface ReflexionPageProps {
  articles: Article[];
  supabaseError?: string | null;
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

const ReflexionPage = ({ articles, supabaseError }: ReflexionPageProps) => {
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
        error={supabaseError}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ReflexionPageProps> = async () => {
  try {
    const { categories } = await loadPublicContent();
    const reflexionCategory = categories.find(
      (category) => category.slug?.toLowerCase() === "reflexion"
    );

    return {
      props: {
        articles: reflexionCategory ? reflexionCategory.articles : [],
        supabaseError: null,
      },
    };
  } catch (error) {
    return {
      props: {
        articles: [],
        supabaseError:
          error instanceof Error
            ? error.message
            : "Impossible de charger la catégorie Réflexion.",
      },
    };
  }
};

export default ReflexionPage;
