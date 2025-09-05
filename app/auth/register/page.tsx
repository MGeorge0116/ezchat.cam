// app/auth/register/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account • EZCam.Chat",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-4 text-2xl font-bold">Create your account</h1>

      <form action="/api/auth/register" method="post" className="space-y-3">
        <div>
          <label className="mb-1 block text-sm opacity-80">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm opacity-80">Username</label>
          <input
            name="username"
            required
            className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm opacity-80">Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-xl border border-white/15 bg-transparent px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="mt-2 h-10 w-full rounded-xl border border-white/20 px-4 text-sm font-semibold hover:border-white/40 active:translate-y-[0.5px]"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
