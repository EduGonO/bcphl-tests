import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

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
      async authorize(credentials) {
        const { username, password } = credentials || {};
        if (
          username === process.env.EDITOR_USER &&
          password === process.env.EDITOR_PASS
        ) {
          return {
            id: username,              // <-- required
            email: username,
            name: "Demo Editor"        // optional
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session }) {
      const email = session.user?.email || "";
      session.user.role = roleMap[email] || null;
      return session;
    }
  },
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET
});
