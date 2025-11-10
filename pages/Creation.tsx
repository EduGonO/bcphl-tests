import Head from "next/head";
import type { GetServerSideProps } from "next";
import CategoryLandingPage from "../app/components/CategoryLandingPage";
import { Article } from "../types";
import { loadPublicContent } from "../lib/supabase/publicContent";

interface CreationPageProps {
  articles: Article[];
  supabaseError?: string | null;
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

const CreationPage = ({ articles, supabaseError }: CreationPageProps) => {
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
        error={supabaseError}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<CreationPageProps> = async () => {
  try {
    const { categories } = await loadPublicContent();
    const creationCategory = categories.find(
      (category) => category.slug?.toLowerCase() === "creation"
    );

    return {
      props: {
        articles: creationCategory ? creationCategory.articles : [],
        supabaseError: null,
      },
    };
  } catch (error) {
    return {
      props: {
        articles: [],
        supabaseError:
          error instanceof Error ? error.message : "Impossible de charger la catégorie Création.",
      },
    };
  }
};

export default CreationPage;
