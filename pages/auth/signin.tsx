import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";
import Head from "next/head";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Check if we have a callback URL from the query parameters
  const callbackUrl = Array.isArray(router.query.callbackUrl)
    ? router.query.callbackUrl[0]
    : router.query.callbackUrl || "/indices";

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl
      });
      
      if (res?.error) {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
      } else if (res?.url) {
        // Successful login with a redirect URL
        window.location.href = res.url;
      } else {
        // Successful login but no redirect URL (shouldn't happen with our config)
        router.push("/indices");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl });
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
      <hr />
      <button onClick={handleGoogleLogin} disabled={isLoading} className="google-button">
        Sign in with Google
      </button>

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
        
        .google-button {
          background-color: #4285f4;
        }
        
        .google-button:hover:not(:disabled) {
          background-color: #3367d6;
        }
      `}</style>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  
  // If user is already logged in, redirect to indices page
  if (session) {
    return { 
      redirect: { 
        destination: "/indices", 
        permanent: false 
      } 
    };
  }
  
  return { props: {} };
};