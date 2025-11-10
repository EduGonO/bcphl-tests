import React from "react";
import SupabaseWorkspace, {
  type SupabaseWorkspaceVariant,
} from "./SupabaseWorkspace";
import type { SupabaseCategorySummary } from "../../../types/supabase";

type EditorShellProps = {
  categories: SupabaseCategorySummary[];
  error?: string | null;
  variant?: SupabaseWorkspaceVariant;
};

const EditorShell: React.FC<EditorShellProps> = ({
  categories,
  error,
  variant = "admin",
}) => {
  return (
    <main className="editor-shell">
      <section className="editor-shell__workspace">
        <SupabaseWorkspace
          categories={categories}
          error={error}
          variant={variant}
        />
      </section>

      <style jsx>{`
        .editor-shell {
          height: calc(100vh - 88px);
          padding: 28px 28px 36px;
          background: linear-gradient(160deg, #f7f7fb 0%, #eef0f8 100%);
          display: flex;
          justify-content: center;
          align-items: stretch;
          box-sizing: border-box;
          overflow: hidden;
        }

        .editor-shell__workspace {
          width: 100%;
          max-width: 1320px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(18, 20, 31, 0.06);
          box-shadow: 0 22px 48px rgba(17, 18, 31, 0.05);
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .editor-shell {
            padding: 24px 22px 32px;
            height: calc(100vh - 96px);
          }

          .editor-shell__workspace {
            padding: 24px 26px;
          }
        }

        @media (max-width: 640px) {
          .editor-shell {
            padding: 18px 16px 26px;
            height: auto;
            min-height: calc(100vh - 96px);
          }

          .editor-shell__workspace {
            padding: 20px 18px;
            border-radius: 18px;
          }
        }
      `}</style>
    </main>
  );
};

export default EditorShell;
