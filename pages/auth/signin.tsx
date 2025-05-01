import { signIn, getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useState } from "react";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleCredentials = async () => {
    await signIn("credentials", {
      redirect: true,
      callbackUrl: "/",
      email,
      password,
    });
  };

  return (
    <div className="wrapper">
      <h1>Sign In</h1>

      <div className="box">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleCredentials}>Sign in</button>
        <hr />
        <button className="google" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </div>

      <style jsx>{`
        .wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 16px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 24px;
        }
        .box {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 320px;
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        input {
          padding: 10px 12px;
          font-size: 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          outline: none;
        }
        button {
          padding: 10px;
          font-size: 14px;
          background: #0069ff;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover {
          background: #0055cc;
        }
        .google {
          background: #ea4335;
        }
        .google:hover {
          background: #c53d2f;
        }
        hr {
          margin: 12px 0;
          border: 0;
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
