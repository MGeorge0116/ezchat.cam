import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Username",
      credentials: { username: { label: "Username", type: "text" } },
      async authorize(credentials) {
        const username = credentials?.username?.trim().toLowerCase();
        return username ? { id: username, name: username } : null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) { if (user?.name) token.name = user.name; return token; },
    async session({ session, token }) { if (token?.name) (session as any).user = { name: token.name }; return session; },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
