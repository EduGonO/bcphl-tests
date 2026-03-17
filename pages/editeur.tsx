import Head from "next/head";
import type { GetServerSideProps } from "next";
import React, { useState } from "react";
import TopNav from "../app/components/TopNav";
import EditorShell from "../app/components/indices/EditorShell";
import type { SupabaseWorkspaceEditorMode } from "../app/components/indices/SupabaseWorkspace";
import type { SupabaseBioEntry, SupabaseCategorySummary } from "../types/supabase";
import { resolveWorkspaceData } from "../lib/supabase/workspace";

interface Props {
  supabaseCats: SupabaseCategorySummary[];
  supabaseBios: SupabaseBioEntry[];
  supabaseError?: string | null;
}

const EditeurPage: React.FC<Props> = ({ supabaseCats, supabaseBios, supabaseError }) => {
  const [editorMode, setEditorMode] = useState<SupabaseWorkspaceEditorMode>("quill");

  return (
    <div className="workspace-page">
      <Head>
        <title>Bicéphale · Éditeur</title>
      </Head>
      <TopNav />

      <div className="editor-switch">
        <span>Éditeur</span>
        <button
          type="button"
          className={editorMode === "quill" ? "active" : ""}
          onClick={() => setEditorMode("quill")}
        >
          Quill
        </button>
        <button
          type="button"
          className={editorMode === "tiptap" ? "active" : ""}
          onClick={() => setEditorMode("tiptap")}
        >
          TipTap
        </button>
      </div>

      <EditorShell
        categories={supabaseCats}
        bios={supabaseBios}
        error={supabaseError}
        variant="writer"
        editorMode={editorMode}
      />

      <style jsx>{`
        .workspace-page {
          height: 100dvh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .editor-switch {
          margin: 8px 24px 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          padding: 6px;
          border-radius: 999px;
          background: rgba(20, 24, 40, 0.08);
          border: 1px solid rgba(20, 24, 40, 0.12);
          font-size: 13px;
        }

        .editor-switch span {
          color: rgba(20, 24, 40, 0.75);
          padding: 0 6px;
          font-weight: 600;
        }

        .editor-switch button {
          border: 0;
          border-radius: 999px;
          padding: 6px 12px;
          background: transparent;
          color: #121827;
          font-weight: 600;
          cursor: pointer;
        }

        .editor-switch button.active {
          background: #d946ef;
          color: #fff;
          box-shadow: 0 8px 18px rgba(217, 70, 239, 0.36);
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
  const { supabaseCats, supabaseBios, supabaseError } = await resolveWorkspaceData();

  return {
    props: {
      supabaseCats,
      supabaseBios,
      supabaseError,
    },
  };
};

export default EditeurPage;
