import Head from "next/head";
import type { GetServerSideProps } from "next";
import React from "react";
import TopNav from "../app/components/TopNav";
import EditorShell from "../app/components/indices/EditorShell";
import type { SupabaseCategorySummary } from "../types/supabase";
import { resolveWorkspaceData } from "../lib/supabase/workspace";

interface Props {
  supabaseCats: SupabaseCategorySummary[];
  supabaseError?: string | null;
}

const EditeurPage: React.FC<Props> = ({ supabaseCats, supabaseError }) => {
  return (
    <>
      <Head>
        <title>Bicéphale · Éditeur</title>
      </Head>
      <TopNav />
      <EditorShell categories={supabaseCats} error={supabaseError} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { supabaseCats, supabaseError } = await resolveWorkspaceData();

  return {
    props: {
      supabaseCats,
      supabaseError,
    },
  };
};

export default EditeurPage;
