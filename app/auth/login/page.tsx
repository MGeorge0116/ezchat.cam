"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
      callbackUrl,
    });
    setLoading(false);
    if (res?.ok) router.push(res.url || callbackUrl);
    else setError("Invalid username/email or password");
  }

  return (
    <main className="wrap" style={{ maxWidth: 420 }}>
      <h1 style={{ margin: "16px 0 12px" }}>Sign in</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="text"
          required
          placeholder="Email or username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid var(--edge)",
            background: "var(--panel)",
            color: "var(--text)",
          }}
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid var(--edge)",
            background: "var(--panel)",
            color: "var(--text)",
          }}
        />
        <button className="btn" disabled={loading} type="submit">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error && <div style={{ color: "#fca5a5" }}>{error}</div>}
      </form>
    </main>
  );
}
