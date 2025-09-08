import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Username",
      credentials: { username: { label: "Username", type: "text" } },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        if (!username) return null;
        // Accept any username for testing; return a simple user object.
        return { id: username, name: username };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.name) token.name = user.name;
      return token;
    },
    async session({ session, token }) {
      if (token?.name) {
        session.user = { name: token.name } as any;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
