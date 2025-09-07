// components/auth/AuthCard.tsx
"use client";

import { FormEvent, useState } from "react";
import { signIn, getSession } from "next-auth/react";

export default function AuthCard() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Registration failed");

      // Auto sign-in after register
      await doSignIn(username, password);
    } catch (e: any) {
      setErr(e?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await doSignIn(username || email, password);
    } catch (e: any) {
      setErr(e?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function doSignIn(userOrEmail: string, pwd: string) {
    const res = await signIn("credentials", {
      redirect: false,
      username: userOrEmail,
      email: userOrEmail,
      password: pwd,
    });
    if (res?.error) throw new Error(res.error);

    // Persist username for the rest of the app (homepage, /my redirect, etc.)
    try {
      const session = await getSession();
      const uname =
        (session?.user as any)?.username ||
        username ||
        (email?.split("@")[0] ?? "");
      if (uname) {
        localStorage.setItem("auth:username", uname.toLowerCase());
        localStorage.setItem("ui:username", uname.toLowerCase());
      }
      if (email) localStorage.setItem("auth:email", email.toLowerCase());
    } catch {}

    // Hide the card by causing HomeGate to detect localStorage
    window.location.replace("/");
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded-xl text-sm ${tab === "login" ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
        <button
          className={`px-3 py-1 rounded-xl text-sm ${tab === "register" ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
          onClick={() => setTab("register")}
        >
          Register
        </button>
      </div>

      {err ? <div className="text-red-400 text-sm mb-3">{err}</div> : null}

      {tab === "login" ? (
        <form className="space-y-3" onSubmit={onLogin}>
          <input
            className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none"
            placeholder="Username or Email"
            value={username || email}
            onChange={(e) => {
              setUsername(e.target.value);
              setEmail(e.target.value);
            }}
          />
          <input
            type="password"
            className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={busy}
            className="w-full rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20"
            type="submit"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>
      ) : (
        <form className="space-y-3" onSubmit={onRegister}>
          <input
            className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full rounded-xl bg-black/30 px-3 py-2 outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            disabled={busy}
            className="w-full rounded-xl px-3 py-2 bg-white/10 hover:bg-white/20"
            type="submit"
          >
            {busy ? "Creating account…" : "Create Account"}
          </button>
        </form>
      )}
    </div>
  );
}
