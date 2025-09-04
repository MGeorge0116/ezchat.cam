import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Lazy-import prisma inside authorize() to avoid top-level crashes
export const authConfig = {
  session: { strategy: "jwt" },
  trustHost: !!process.env.AUTH_TRUST_HOST,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;
        const { prisma } = await import("@/lib/prisma");
        const user = await prisma.user.findUnique({
          where: { email: String(creds.email) },
        });
        if (!user) return null;
        const ok = await compare(String(creds.password), user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.username };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.username = (user as any).name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.uid) {
        (session as any).userId = token.uid;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  debug: true, // keep in dev to surface issues
} satisfies NextAuthConfig;
