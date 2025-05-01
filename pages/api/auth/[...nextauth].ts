import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role?: string | null;
    };
  }
  
  interface JWT {
    role?: string | null;
  }
}

const roleMap: Record<string, "admin" | "editor"> = {
  "admin@example.com": "admin",
  "editor@example.com": "editor"
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || ""
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        // Check if credentials match the environment variables
        if (
          credentials.email === process.env.EDITOR_USER &&
          credentials.password === process.env.EDITOR_PASS
        ) {
          return {
            id: "1",
            email: credentials.email,
            name: "Editor",
            role: roleMap[credentials.email] || null
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        // @ts-ignore - The user type doesn't know about our custom role property
        token.role = user.role || roleMap[user.email as string] || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.role = token.role as string || null;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { 
    signIn: "/auth/signin",
    error: "/auth/signin"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development"
};

export default NextAuth(authOptions);