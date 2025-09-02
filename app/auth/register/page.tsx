"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [email, setEmail]     = React.useState("");
  const [password, setPassword] = React.useState("");
  const [over18, setOver18]   = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!over18) { setError("You must confirm you are 18 or older."); return; }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, over18 }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      setError(data?.error || "Registration failed");
      return;
    }

    const login = await signIn("credentials", {
      identifier: email, password, redirect: false, callbackUrl: "/",
    });

    setLoading(false);
    if (login?.ok) router.push("/");
    else setError("Registered but sign-in failed—try logging in.");
  }

  return (
    <main className="wrap" style={{ maxWidth: 460 }}>
      <h1 style={{ margin: "16px 0 12px" }}>Register</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          type="text" required placeholder="Username"
          value={username} onChange={(e) => setUsername(e.target.value)}
          style={{ padding:10, borderRadius:8, border:"1px solid var(--edge)", background:"var(--panel)", color:"var(--text)" }}
        />
        <input
          type="email" required placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding:10, borderRadius:8, border:"1px solid var(--edge)", background:"var(--panel)", color:"var(--text)" }}
        />
        <input
          type="password" required placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding:10, borderRadius:8, border:"1px solid var(--edge)", background:"var(--panel)", color:"var(--text)" }}
        />

        <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, color:"var(--muted)" }}>
          <input type="checkbox" checked={over18} onChange={(e)=>setOver18(e.target.checked)} />
          I confirm that I am 18 years of age or older.
        </label>

        <button className="btn" disabled={loading} type="submit">
          {loading ? "Creating account…" : "Create account"}
        </button>
        {error && <div style={{ color:"#fca5a5" }}>{error}</div>}
      </form>
    </main>
  );
}
