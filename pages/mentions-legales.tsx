import Head from "next/head";
import React from "react";
import Footer from "../app/components/Footer";
import TopNav from "../app/components/TopNav";

const MentionsLegalesPage: React.FC = () => {
  return (
    <div className="legal-page">
      <Head>
        <title>Bicéphale · Mentions légales</title>
      </Head>
      <TopNav />
      <div className="legal-layout">
        <aside className="legal-sidebar" aria-hidden="true" />
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
          background: #f7f7f7;
        }

        .legal-layout {
          flex: 1;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          padding: 32px 24px 0;
        }

        .legal-sidebar {
          background: #000;
          border-radius: 12px;
          min-height: 320px;
        }

        .legal-main {
          background: #fff;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
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
            grid-template-columns: 1fr;
            padding: 24px 20px 0;
          }

          .legal-sidebar {
            min-height: 120px;
            height: 120px;
          }
        }

        @media (max-width: 640px) {
          .legal-layout {
            padding: 20px 16px 0;
            gap: 16px;
          }

          .legal-main {
            padding: 24px;
          }

          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default MentionsLegalesPage;
