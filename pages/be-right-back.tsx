import Head from "next/head";
import Image from "next/image";

export default function BeRightBackPage() {
  return (
    <>
      <Head>
        <title>Nous revenons vite – BICÉPHALE</title>
        <meta name="robots" content="noindex,nofollow,noarchive,nosnippet" />
      </Head>

      <main className="page">
        <div className="logo-frame">
          <Image
            src="/logo-carre_bicephale_rvb.png"
            alt="Logo BICÉPHALE"
            fill
            sizes="200px"
            priority
          />
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: radial-gradient(circle at 15% 20%, rgba(244, 247, 252, 0.6), transparent 60%),
            radial-gradient(circle at 85% 0%, rgba(236, 240, 246, 0.55), transparent 55%),
            linear-gradient(180deg, #ffffff 0%, #f9fafc 100%);
        }

        .logo-frame {
          position: relative;
          width: min(200px, 55vw);
          aspect-ratio: 1;
          border-radius: 24px;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
