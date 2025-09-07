// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * IMPORTANT:
 *  - Set NEXTAUTH_SECRET (or AUTH_SECRET) in .env.local and on Vercel.
 *    Example:
 *      NEXTAUTH_SECRET=your-long-random-secret
 *      NEXTAUTH_URL=https://your-domain.vercel.app
 *
 *  - This config uses a minimal Credentials provider that
 *    treats name/email as a lightweight identity for your beta.
 *    If you later add a real DB user + password, replace the
 *    authorize() logic accordingly.
 */

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    Credentials({
      name: "Guest / Credentials",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Your name" },
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
      },
      async authorize(credentials) {
        // Minimal, no-password “beta” flow.
        // Accepts any name/email and issues a session.
        const name = (credentials?.name || "").toString().trim();
        const email = (credentials?.email || "").toString().trim();

        if (!name && !email) {
          // Must provide at least one identifier
          return null;
        }

        // Create a stable-ish ID for the session (email preferred)
        const id =
          (email && `email:${email.toLowerCase()}`) ||
          `anon:${crypto.randomUUID()}`;

        return {
          id,
          name: name || (email ? email.split("@")[0] : "GUEST"),
          email: email || undefined,
        };
      },
    }),
  ],

  callbacks: {
    // Persist user fields onto the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id ?? token.id;
        token.username =
          (user as any).username ??
          user.name ??
          (user.email ? user.email.split("@")[0] : undefined);
      }
      return token;
    },

    // Expose fields to the client session
    async session({ session, token }) {
      if (!session.user) session.user = { name: null, email: null } as any;

      (session.user as any).id = token.id ?? (session.user as any).id ?? "";
      (session.user as any).username =
        token.username ??
        (session.user?.name ?? (session.user?.email?.split("@")[0] ?? "GUEST"));

      return session;
    },
  },
};
