import Head from "next/head";
import type { GetServerSideProps } from "next";
import React from "react";
import TopNav from "../app/components/TopNav";
import EditorShell from "../app/components/indices/EditorShell";
import type { SupabaseBioEntry, SupabaseCategorySummary } from "../types/supabase";
import { resolveWorkspaceData } from "../lib/supabase/workspace";

interface Props {
  supabaseCats: SupabaseCategorySummary[];
  supabaseBios: SupabaseBioEntry[];
  supabaseError?: string | null;
}

const EditeurPage: React.FC<Props> = ({ supabaseCats, supabaseBios, supabaseError }) => {
  return (
    <div className="workspace-page">
      <Head>
        <title>Bic\u00e9phale \u00b7 \u00c9diteur</title>
      </Head>
      <TopNav />

      <EditorShell
        categories={supabaseCats}
        bios={supabaseBios}
        error={supabaseError}
        variant="writer"
        editorMode="tiptap"
      />

      <style jsx>{`
        .workspace-page {
          height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .workspace-page :global(.editor-shell) {
          flex: 1;
          display: flex;
          min-height: 0;
        }
      `}</style>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { supabaseCats, supabaseBios, supabaseError } = await resolveWorkspaceData();
  return {
    props: { supabaseCats, supabaseBios, supabaseError },
  };
};

export default EditeurPage;
