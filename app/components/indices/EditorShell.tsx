import React from "react";
import SupabaseWorkspace, {
  type SupabaseWorkspaceVariant,
} from "./SupabaseWorkspace";
import type { SupabaseBioEntry, SupabaseCategorySummary } from "../../../types/supabase";

type EditorShellProps = {
  categories: SupabaseCategorySummary[];
  bios: SupabaseBioEntry[];
  error?: string | null;
  variant?: SupabaseWorkspaceVariant;
};

const EditorShell: React.FC<EditorShellProps> = ({
  categories,
  bios,
  error,
  variant = "admin",
}) => {
  return (
    <main className="editor-shell">
      <section className="editor-shell__workspace">
        <SupabaseWorkspace
          categories={categories}
          bios={bios}
          error={error}
          variant={variant}
        />
      </section>

      <style jsx>{`
        .editor-shell {
          flex: 1;
          min-height: 0;
          padding: 18px 22px;
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
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .editor-shell {
            padding: 14px 16px;
          }

          .editor-shell__workspace {
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .editor-shell {
            padding: 10px 12px;
          }

          .editor-shell__workspace {
            padding: 14px;
            border-radius: 18px;
          }
        }
      `}</style>
    </main>
  );
};

export default EditorShell;
