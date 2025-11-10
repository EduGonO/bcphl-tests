import React from "react";
import SupabaseWorkspace from "./SupabaseWorkspace";
import type { SupabaseCategorySummary } from "../../../types/supabase";

type EditorShellProps = {
  eyebrow: string;
  title: string;
  sessionEmail: string;
  categories: SupabaseCategorySummary[];
  error?: string | null;
  onSignOut: () => void;
};

const EditorShell: React.FC<EditorShellProps> = ({
  eyebrow,
  title,
  sessionEmail,
  categories,
  error,
  onSignOut,
}) => {
  return (
    <main className="editor-shell">
      <div className="editor-shell__container">
        <header className="editor-shell__header">
          <div>
            <p className="editor-shell__eyebrow">{eyebrow}</p>
            <h1 className="editor-shell__title">{title}</h1>
          </div>
          <div className="editor-shell__session">
            <div className="editor-shell__session-info">
              <span className="editor-shell__session-label">Connecté·e</span>
              <span className="editor-shell__session-email">{sessionEmail}</span>
            </div>
            <button type="button" className="editor-shell__signout" onClick={onSignOut}>
              Déconnexion
            </button>
          </div>
        </header>

        <section className="editor-shell__workspace">
          <SupabaseWorkspace categories={categories} error={error} />
        </section>
      </div>

      <style jsx>{`
        .editor-shell {
          min-height: calc(100vh - 64px);
          padding: 32px 24px 40px;
          background: linear-gradient(160deg, #f7f7fb 0%, #eef0f8 100%);
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }

        .editor-shell__container {
          width: 100%;
          max-width: 1320px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .editor-shell__header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          padding: 28px 32px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(18, 20, 31, 0.08);
          box-shadow: 0 18px 42px rgba(17, 18, 31, 0.06);
        }

        .editor-shell__eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: #7b7d86;
        }

        .editor-shell__title {
          margin: 0;
          font-size: 28px;
          line-height: 1.2;
          color: #181920;
        }

        .editor-shell__session {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(24, 25, 32, 0.04);
          border-radius: 16px;
          padding: 14px 18px;
        }

        .editor-shell__session-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .editor-shell__session-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7b7d86;
        }

        .editor-shell__session-email {
          font-size: 13px;
          color: #181920;
          font-weight: 600;
          word-break: break-word;
        }

        .editor-shell__signout {
          border: none;
          background: #181920;
          color: #ffffff;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          border-radius: 999px;
          padding: 9px 20px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .editor-shell__signout:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(24, 25, 32, 0.18);
        }

        .editor-shell__workspace {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(18, 20, 31, 0.06);
          box-shadow: 0 22px 48px rgba(17, 18, 31, 0.05);
          padding: 28px;
        }

        @media (max-width: 960px) {
          .editor-shell {
            padding: 24px 18px 32px;
          }

          .editor-shell__header {
            flex-direction: column;
            align-items: stretch;
          }

          .editor-shell__session {
            justify-content: space-between;
          }
        }

        @media (max-width: 640px) {
          .editor-shell__workspace {
            padding: 20px;
          }

          .editor-shell__header {
            padding: 20px;
          }

          .editor-shell__title {
            font-size: 24px;
          }

          .editor-shell__signout {
            padding: 8px 16px;
          }
        }
      `}</style>
    </main>
  );
};

export default EditorShell;
