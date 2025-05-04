import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { authOptions } from "../api/auth/[...nextauth]";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Check if we have a callback URL from the query parameters
  const callbackUrl = Array.isArray(router.query.callbackUrl)
    ? router.query.callbackUrl[0]
    : router.query.callbackUrl || "/indices";

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      console.log("SignIn: Already authenticated, redirecting to:", callbackUrl);
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  // Debug information
  useEffect(() => {
    setDebugInfo(`Auth Status: ${status} | Callback URL: ${callbackUrl}`);
  }, [status, callbackUrl]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setDebugInfo(`Attempting login with email: ${email}`);
    
    try {
      // Let NextAuth handle the redirect
      await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl
      });
      // (no further code--NextAuth will redirect you straight to callbackUrl)
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error(err);
      setDebugInfo(`Error during login: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Sign In – BICÉPHALE</title>
      </Head>
      
      <h1>Sign In</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleCredentialsLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      
      {process.env.NODE_ENV === "development" && debugInfo && (
        <div className="debug-info">
          <h3>Debug Info</h3>
          <pre>{debugInfo}</pre>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 80px auto;
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        h1 {
          margin-bottom: 1rem;
          font-size: 1.8rem;
          text-align: center;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        button {
          width: 100%;
          padding: 0.75rem;
          background-color: #111;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          opacity: ${isLoading ? 0.7 : 1};
        }

        button:hover:not(:disabled) {
          background-color: #333;
        }

        button:disabled {
          cursor: not-allowed;
        }

        hr {
          margin: 1.5rem 0;
          border: none;
          border-top: 1px solid #eee;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .debug-info {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #f5f5f5;
          border-radius: 8px;
          font-size: 0.8rem;
        }
        
        .debug-info pre {
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Use getServerSession instead of getSession
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  
  // If user is already logged in, redirect to indices page
  if (session) {
    return { 
      redirect: { 
        destination: ctx.query.callbackUrl as string || "/indices", 
        permanent: false 
      } 
    };
  }
  
  return { props: {} };
};