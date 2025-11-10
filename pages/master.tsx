import Head from "next/head";
import type { GetServerSideProps } from "next";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import TopNav from "../app/components/TopNav";
import EditorShell from "../app/components/indices/EditorShell";
import type { SupabaseCategorySummary } from "../types/supabase";
import { resolveWorkspaceData } from "../lib/supabase/workspace";

type Props = {
  supabaseCats: SupabaseCategorySummary[];
  supabaseError?: string | null;
};

const MasterPage: React.FC<Props> = ({ supabaseCats, supabaseError }) => {
  const { data: session } = useSession();
  const sessionEmail = session?.user?.email ?? "Session non identifiée";

  return (
    <>
      <Head>
        <title>Bicéphale · Master</title>
      </Head>
      <TopNav />
      <EditorShell
        eyebrow="Master"
        title="Espace master"
        sessionEmail={sessionEmail}
        categories={supabaseCats}
        error={supabaseError}
        onSignOut={() => signOut()}
      />
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

export default MasterPage;
