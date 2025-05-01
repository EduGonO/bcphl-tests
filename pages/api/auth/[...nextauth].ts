import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role?: string | null;
    };
  }
}

const roleMap: Record<string,"admin"|"editor"> = {
  "admin@example.com": "admin",
  "editor@example.com": "editor"
};

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!
    }),
    CredentialsProvider({
  name: "Credentials",
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials, req) {
    // 1) ensure credentials object and fields exist
    if (
      !credentials ||
      typeof credentials.username !== "string" ||
      typeof credentials.password !== "string"
    ) {
      return null;
    }

    // 2) check against your demo env vars
    if (
      credentials.username === process.env.EDITOR_USER &&
      credentials.password === process.env.EDITOR_PASS
    ) {
      const u = credentials.username;  // now a guaranteed string
      return {
        id: u,
        email: u,
        name: "Demo Editor"
      };
    }

    return null;
  }
})

  ],
  callbacks: {
  async session({ session }) {
    if (session.user) {
      const email = session.user.email ?? "";
      session.user.role = roleMap[email] ?? null;
    }
    return session;
  }
},

  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET
});
