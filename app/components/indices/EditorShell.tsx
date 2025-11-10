import React from "react";
import SupabaseWorkspace from "./SupabaseWorkspace";
import type { SupabaseCategorySummary } from "../../../types/supabase";

type EditorShellProps = {
  categories: SupabaseCategorySummary[];
  error?: string | null;
};

const EditorShell: React.FC<EditorShellProps> = ({ categories, error }) => {
  return (
    <main className="editor-shell">
      <section className="editor-shell__workspace">
        <SupabaseWorkspace categories={categories} error={error} />
      </section>

      <style jsx>{`
        .editor-shell {
          min-height: calc(100vh - 72px);
          padding: 32px 24px 48px;
          background: linear-gradient(160deg, #f7f7fb 0%, #eef0f8 100%);
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }

        .editor-shell__workspace {
          width: 100%;
          max-width: 1320px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(18, 20, 31, 0.06);
          box-shadow: 0 22px 48px rgba(17, 18, 31, 0.05);
          padding: 32px;
        }

        @media (max-width: 1024px) {
          .editor-shell {
            padding: 28px 20px 40px;
          }

          .editor-shell__workspace {
            padding: 26px;
          }
        }

        @media (max-width: 640px) {
          .editor-shell {
            padding: 22px 16px 32px;
          }

          .editor-shell__workspace {
            padding: 20px 16px 24px;
            border-radius: 18px;
          }
        }
      `}</style>
    </main>
  );
};

export default EditorShell;
