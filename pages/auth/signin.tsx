import { signIn, getSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignIn() {
  const router = useRouter();
  useEffect(() => {
    // Optional: redirect after login
    if (router.query.callbackUrl) {
      router.push(router.query.callbackUrl as string);
    }
  }, [router]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Sign In</h1>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
      <button onClick={() => signIn("credentials")}>Sign in with Username/Password</button>
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
