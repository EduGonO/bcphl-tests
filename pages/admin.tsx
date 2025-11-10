import Head from "next/head";
import type { GetServerSideProps } from "next";
import React from "react";
import TopNav from "../app/components/TopNav";
import EditorShell from "../app/components/indices/EditorShell";
import type { SupabaseCategorySummary } from "../types/supabase";
import { resolveWorkspaceData } from "../lib/supabase/workspace";

type Props = {
  supabaseCats: SupabaseCategorySummary[];
  supabaseError?: string | null;
};

const AdminPage: React.FC<Props> = ({ supabaseCats, supabaseError }) => {
  return (
    <div className="workspace-page">
      <Head>
        <title>Bicéphale · Admin</title>
      </Head>
      <TopNav />
      <EditorShell
        categories={supabaseCats}
        error={supabaseError}
        variant="admin"
      />

      <style jsx>{`
        .workspace-page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
        }

        .workspace-page :global(.editor-shell) {
          flex: 1;
          display: flex;
        }
      `}</style>
    </div>
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

export default AdminPage;
