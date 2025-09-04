"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const callbackUrl = sp?.get("callbackUrl") ?? "/";

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrMsg(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setErrMsg(res.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      // Success: go to callbackUrl (or home)
      router.push(res?.url || callbackUrl || "/");
    } catch (e) {
      setErrMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
        Sign in
      </h1>
      <p style={{ marginBottom: 18, color: "var(--muted)" }}>
        Use your email or username with your password.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Email or username</span>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com or yourhandle"
            required
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--edge)",
              background: "var(--panel)",
              color: "var(--text)",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid var(--edge)",
              background: "var(--panel)",
              color: "var(--text)",
            }}
          />
        </label>

        {errMsg ? (
          <div
            style={{
              marginTop: 4,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #7f1d1d",
              background: "#991b1b",
              color: "#fff",
              fontSize: 13,
            }}
          >
            {errMsg}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="btn"
          style={{
            marginTop: 6,
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            border: "1px solid var(--btn-edge)",
            background: "var(--btn)",
            color: "var(--text)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
        You’ll be redirected to:{" "}
        <code
          style={{
            padding: "2px 6px",
            borderRadius: 6,
            border: "1px solid var(--edge)",
            background: "var(--panel)",
          }}
        >
          {callbackUrl}
        </code>
      </div>
    </div>
  );
}
