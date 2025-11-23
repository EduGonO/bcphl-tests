import Head from "next/head";
import React from "react";

import Footer from "../app/components/Footer";
import TopNav from "../app/components/TopNav";

const MentionsLegalesPage: React.FC = () => {
  return (
    <div>
      <Head>
        <title>Bicéphale · Mentions légales</title>
      </Head>
      <TopNav />
      <main className="legal-main">
        <h1>Mentions légales</h1>
      </main>
      <Footer />

      <style jsx>{`
        .legal-main {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          text-align: center;
        }

        h1 {
          margin: 0;
          font-family: "GayaRegular", "RecoletaMedium", sans-serif;
          font-size: 28px;
          letter-spacing: 0.4px;
        }

        @media (max-width: 640px) {
          h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default MentionsLegalesPage;
