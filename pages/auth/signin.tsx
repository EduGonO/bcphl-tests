import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { authOptions } from "../api/auth/[...nextauth]";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { status } = useSession();

  const callbackUrl = Array.isArray(router.query.callbackUrl)
    ? router.query.callbackUrl[0]
    : router.query.callbackUrl || "/editeur";

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl
      });
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <Head>
        <title>Connexion – BICÉPHALE</title>
      </Head>

      <div className="card">
        <div className="logo-frame">
          <Image
            src="/logo-carre_bicephale_rvb.png"
            alt="Logo BICÉPHALE"
            fill
            sizes="160px"
            priority
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleCredentialsLogin}>
          <label className="input-wrapper">
            <span>E-mail</span>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </label>
          <label className="input-wrapper">
            <span>Mot de passe</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </label>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem);
          background: radial-gradient(circle at 15% 20%, rgba(244, 247, 252, 0.6), transparent 60%),
            radial-gradient(circle at 85% 0%, rgba(236, 240, 246, 0.55), transparent 55%),
            linear-gradient(180deg, #ffffff 0%, #f9fafc 100%);
        }

        .card {
          width: min(360px, 100%);
          padding: clamp(2rem, 5vw, 3rem);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(229, 231, 235, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(1.5rem, 4vw, 2.25rem);
        }

        .logo-frame {
          position: relative;
          width: 120px;
          aspect-ratio: 1;
          border-radius: 18px;
          overflow: hidden;
        }

        form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.84rem;
          color: rgba(15, 23, 42, 0.7);
          letter-spacing: 0.02em;
        }

        input {
          width: 100%;
          padding: 0.85rem 1rem;
          border-radius: 16px;
          border: 1px solid rgba(209, 213, 219, 0.7);
          box-sizing: border-box;
          background: rgba(248, 250, 255, 0.75);
          color: rgba(15, 23, 42, 0.86);
          font-size: 0.95rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        input::placeholder {
          color: rgba(100, 116, 139, 0.42);
        }

        input:focus {
          outline: none;
          border-color: rgba(148, 163, 184, 0.85);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.16);
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        button {
          width: 100%;
          padding: 0.85rem;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #111827, #1f2937);
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: transform 0.2s ease, background 0.2s ease;
          cursor: pointer;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .error-message {
          width: 100%;
          border-radius: 12px;
          padding: 0.8rem 1rem;
          background: rgba(248, 113, 113, 0.08);
          color: rgba(185, 28, 28, 0.85);
          border: 1px solid rgba(248, 113, 113, 0.2);
          font-size: 0.82rem;
          text-align: center;
        }

        @media (max-width: 600px) {
          .page {
            padding: 2.5rem 1.5rem;
          }

          .card {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: (ctx.query.callbackUrl as string) || "/editeur",
        permanent: false
      }
    };
  }

  return { props: {} };
};
