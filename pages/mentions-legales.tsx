import Head from "next/head";
import React, { useState } from "react";

import Footer from "../app/components/Footer";
import RedesignSearchSidebar from "../app/components/RedesignSearchSidebar";
import TopNav from "../app/components/TopNav";
import { getArticleRecords } from "../lib/articleService";
import { Article } from "../types";

interface MentionsLegalesPageProps {
  articles: Article[];
}

const MentionsLegalesPage: React.FC<MentionsLegalesPageProps> = ({ articles }) => {
  const [query, setQuery] = useState("");

  return (
    <div className="legal-page">
      <Head>
        <title>Bicéphale · Mentions légales</title>
      </Head>
      <TopNav />
      <div className="legal-layout">
        <div className="sidebar-column">
          <RedesignSearchSidebar
            query={query}
            onQueryChange={setQuery}
            articles={articles}
          />
        </div>
        <main className="legal-main">
          <h1>Mentions légales</h1>
        </main>
      </div>
      <Footer marginTop="80px" />

      <style jsx>{`
        .legal-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #ffffff;
        }

        .legal-layout {
          flex: 1;
          display: flex;
          gap: 24px;
          padding: 32px 24px 0;
          max-width: 1400px;
          width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
        }

        .sidebar-column {
          flex: 0 0 300px;
          min-width: 240px;
        }

        .legal-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 12px 8px 0;
          gap: 16px;
        }

        h1 {
          margin: 0;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
          font-size: 28px;
          letter-spacing: 0.4px;
        }

        @media (max-width: 1023px) {
          .legal-layout {
            flex-direction: column;
            padding: 24px 20px 0;
          }

          .sidebar-column {
            flex: 1;
            min-width: 0;
          }
        }

        @media (max-width: 640px) {
          .legal-layout {
            padding: 20px 16px 0;
            gap: 16px;
          }

          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export async function getServerSideProps() {
  const records = await getArticleRecords();
  const articles = records.map(({ article }) => article);

  return { props: { articles } };
}

export default MentionsLegalesPage;
