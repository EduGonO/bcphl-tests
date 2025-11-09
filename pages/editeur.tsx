import Head from "next/head";
import type { GetServerSideProps } from "next";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import TopNav from "../app/components/TopNav";
import SupabaseWorkspace from "../app/components/indices/SupabaseWorkspace";
import { getSupabaseServerClient } from "../lib/supabase/serverClient";
import {
  formatSupabaseError,
  loadSupabaseCategorySummaries,
} from "../lib/supabase/content";
import type { SupabaseCategorySummary } from "../types/supabase";

interface Props {
  supabaseCats: SupabaseCategorySummary[];
  supabaseError?: string | null;
}

const EditeurPage: React.FC<Props> = ({ supabaseCats, supabaseError }) => {
  const { data: session } = useSession();

  const sessionEmail = session?.user?.email ?? "Session non identifiée";

  return (
    <>
      <Head>
        <title>Bicéphale · Éditeur</title>
      </Head>
      <TopNav />
      <main className="editeur">
        <div className="editeur__container">
          <header className="editeur__header">
            <div>
              <p className="editeur__eyebrow">Éditeur</p>
              <h1 className="editeur__title">Espace rédaction Supabase</h1>
              <p className="editeur__description">
                Consultez, éditez et publiez les articles stockés dans Supabase. Les
                changements sont enregistrés directement dans la base de données et
                reflétés dans le site public.
              </p>
            </div>
            <div className="editeur__session">
              <div className="editeur__session-info">
                <span className="editeur__session-label">Connecté·e</span>
                <span className="editeur__session-email">{sessionEmail}</span>
              </div>
              <button
                type="button"
                className="editeur__signout"
                onClick={() => signOut()}
              >
                Déconnexion
              </button>
            </div>
          </header>

          <section className="editeur__workspace">
            <SupabaseWorkspace categories={supabaseCats} error={supabaseError} />
          </section>
        </div>
      </main>

      <style jsx>{`
        .editeur {
          min-height: calc(100vh - 64px);
          padding: 32px 24px 40px;
          background: linear-gradient(160deg, #f7f7fb 0%, #eef0f8 100%);
          display: flex;
          justify-content: center;
          box-sizing: border-box;
        }

        .editeur__container {
          width: 100%;
          max-width: 1320px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .editeur__header {
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

        .editeur__eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.24em;
          color: #7b7d86;
        }

        .editeur__title {
          margin: 0;
          font-size: 28px;
          line-height: 1.2;
          color: #181920;
        }

        .editeur__description {
          margin: 12px 0 0;
          max-width: 540px;
          font-size: 15px;
          line-height: 1.6;
          color: #4b4d55;
        }

        .editeur__session {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(24, 25, 32, 0.04);
          border-radius: 16px;
          padding: 14px 18px;
        }

        .editeur__session-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .editeur__session-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          color: #7b7d86;
        }

        .editeur__session-email {
          font-size: 13px;
          color: #181920;
          font-weight: 600;
          word-break: break-word;
        }

        .editeur__signout {
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

        .editeur__signout:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 18px rgba(24, 25, 32, 0.18);
        }

        .editeur__workspace {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(18, 20, 31, 0.06);
          box-shadow: 0 22px 48px rgba(17, 18, 31, 0.05);
          padding: 28px;
        }

        @media (max-width: 960px) {
          .editeur {
            padding: 24px 18px 32px;
          }

          .editeur__header {
            flex-direction: column;
            align-items: stretch;
          }

          .editeur__session {
            justify-content: space-between;
          }
        }

        @media (max-width: 640px) {
          .editeur__workspace {
            padding: 20px;
          }

          .editeur__header {
            padding: 20px;
          }

          .editeur__title {
            font-size: 24px;
          }

          .editeur__description {
            font-size: 14px;
          }

          .editeur__signout {
            padding: 8px 16px;
          }
        }
      `}</style>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  let supabaseCats: SupabaseCategorySummary[] = [];
  let supabaseError: string | null = null;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      supabaseError =
        "Configurer SUPABASE_URL et SUPABASE_KEY pour activer la synchronisation Supabase.";
    } else {
      supabaseCats = await loadSupabaseCategorySummaries(supabase);
    }
  } catch (error) {
    supabaseError = formatSupabaseError(error);
  }

  return {
    props: {
      supabaseCats,
      supabaseError,
    },
  };
};

export default EditeurPage;
