// web/lib/auth.ts
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

/** Prisma singleton (HMR-safe in dev) */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Look up by username OR email */
async function findUser(identifier: string) {
  const isEmail = identifier.includes("@");
  if (isEmail) return prisma.user.findUnique({ where: { email: identifier } });
  return prisma.user.findUnique({ where: { username: identifier } });
}

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const identifier = creds?.identifier?.toString().trim();
        const password = creds?.password?.toString();
        if (!identifier || !password) return null;

        const user = await findUser(identifier);
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // include username so the header can show "<username> (email)"
        const ageVerifiedISO = user.ageVerifiedAt
          ? new Date(user.ageVerifiedAt).toISOString()
          : undefined;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username,
          username: user.username,
          ageVerifiedAt: ageVerifiedISO,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.email = (user as any).email;
        token.name = (user as any).name;
        token.username = (user as any).username;
        token.ageVerifiedAt = (user as any).ageVerifiedAt;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).userId = (token as any).uid;
      // extend session.user with username
      (session.user as any) = {
        ...(session.user || {}),
        email: (token as any).email,
        name: (token as any).name,
        username: (token as any).username,
      };
      (session as any).ageVerifiedAt = (token as any).ageVerifiedAt;
      return session;
    },
  },
} satisfies NextAuthConfig;
