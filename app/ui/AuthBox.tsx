"use client";

import * as React from "react";

type Mode = "login" | "register";

export default function AuthBox() {
  const [mode, setMode] = React.useState<Mode>("login");
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const switchMode = React.useCallback((m: Mode) => {
    setMode(m);
    setMsg(null);
  }, []);

  const onSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setBusy(true);
      setMsg(null);
      try {
        if (mode === "register") {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password }),
          });
          if (!res.ok) throw new Error("Registration failed");
          setMsg("Registered! You can sign in now.");
          setMode("login");
        } else {
          // Stub login; integrate NextAuth or your API when ready.
          if (!username || !password) throw new Error("Missing credentials");
          setMsg("Signed in (stub). Wire to NextAuth to complete.");
        }
      } catch (err) {
        setMsg(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setBusy(false);
      }
    },
    [mode, email, username, password]
  );

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-700/50 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-semibold">
          {mode === "login" ? "Sign in" : "Create account"}
        </div>
        <div className="text-sm">
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="underline hover:no-underline"
            >
              Register
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="underline hover:no-underline"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "register" && (
          <label className="block">
            <span className="mb-1 block text-sm opacity-80">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.currentTarget.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
              required
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm opacity-80">Username</span>
          <input
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUsername(e.currentTarget.value)
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm opacity-80">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.currentTarget.value)
            }
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2"
            required
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Working…" : mode === "login" ? "Sign in" : "Register"}
        </button>

        {msg && <p className="text-center text-sm opacity-80">{msg}</p>}
      </form>
    </div>
  );
}
