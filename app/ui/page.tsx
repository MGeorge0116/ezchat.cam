'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, isOver18 }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Registration failed.");
        setBusy(false);
        return;
      }

      // Auto sign-in with the credentials you just set
      const si = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (si?.error) {
        setError("Account created. Please sign in.");
        setBusy(false);
        return;
      }

      router.push(`/room/${username.toLowerCase()}`);
    } catch (err) {
      setError("Unexpected error.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            placeholder="yourname"
            autoComplete="username"
            required
          />
          <p className="mt-1 text-xs opacity-70">
            3–32 chars: a–z, 0–9, dot, underscore, hyphen.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 bg-transparent"
            placeholder="••••••••"
            autoComplete="new-password"
            required
          />
          <p className="mt-1 text-xs opacity-70">At least 8 characters.</p>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isOver18}
            onChange={(e) => setIsOver18(e.target.checked)}
            className="size-4"
            required
          />
          <span>I confirm I am 18 or older.</span>
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl border px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
          >
            {busy ? "Creating..." : "Create account"}
          </button>
          <Link
            href="/"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            Cancel
          </Link>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </main>
  );
}
