"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GetServerSideProps } from "next";
import { getSession, signIn } from "next-auth/react";


export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) router.push("/");
    else alert("Invalid credentials");
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="container">
      <h1>Sign In</h1>
      <form onSubmit={handleCredentialsLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign In</button>
      </form>
      <hr />
      <button onClick={handleGoogleLogin}>Sign in with Google</button>

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
        }

        button:hover {
          background-color: #333;
        }

        hr {
          margin: 1.5rem 0;
          border: none;
          border-top: 1px solid #eee;
        }
      `}</style>
    </div>
  );
}


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
};
