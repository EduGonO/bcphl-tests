import Head from "next/head";
import type { GetServerSideProps } from "next";
import React, { useState } from "react";
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
  const [useQuill, setUseQuill] = useState(false);

  return (
    <div className="workspace-page">
      <Head>
        <title>Bicéphale · Éditeur</title>
      </Head>
      <TopNav />

      {/* Editor toggle — dev/debug utility */}
      <div className="editor-toggle">
        <button
          type="button"
          className={`editor-toggle__btn${!useQuill ? " editor-toggle__btn--active" : ""}`}
          onClick={() => setUseQuill(false)}
        >
          TipTap
        </button>
        <button
          type="button"
          className={`editor-toggle__btn${useQuill ? " editor-toggle__btn--active" : ""}`}
          onClick={() => setUseQuill(true)}
        >
          Quill
        </button>
      </div>

      <EditorShell
        categories={supabaseCats}
        bios={supabaseBios}
        error={supabaseError}
        variant="writer"
        editorMode={useQuill ? "quill" : "tiptap"}
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

        .editor-toggle {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 16px 0;
          background: transparent;
        }

        .editor-toggle__btn {
          padding: 3px 12px;
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: #fff;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.1s;
        }

        .editor-toggle__btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .editor-toggle__btn--active {
          background: #4f46e5;
          border-color: #4338ca;
          color: #fff;
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
