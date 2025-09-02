import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/** Find by username OR email */
async function findUser(identifier: string) {
  const isEmail = identifier.includes("@");
  if (isEmail) return prisma.user.findUnique({ where: { email: identifier.toLowerCase() } });
  return prisma.user.findUnique({ where: { username: identifier.toLowerCase() } });
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login", error: "/auth/error" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        const identifier = creds?.identifier?.toString().trim() ?? "";
        const password = creds?.password?.toString() ?? "";
        if (!identifier || !password) return null;

        const user = await findUser(identifier);
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          username: user.username,
          ageVerifiedAt: user.ageVerifiedAt?.toISOString?.(),
        } as any;
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
};
