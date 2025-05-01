import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { DefaultSession } from "next-auth";

// Extend the default session and JWT types
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

type UserWithRole = {
  email?: string | null;
  role?: string | null;
};

const roleMap: Record<string, "admin" | "editor"> = {
  "admin@example.com": "admin",
  "editor@example.com": "editor"
};

export const authOptions: NextAuthOptions = {
  providers: [
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
        
        // Add debug logging
        console.log(`Login attempt failed for email: ${credentials.email}`);
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
    if (user) {
      const u = user as UserWithRole;
      token.email = u.email;
      token.role = u.role || roleMap[u.email || ""] || null;
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