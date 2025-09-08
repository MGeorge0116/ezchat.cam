"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginClient() {
  const [username, setUsername] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!u) return;
    await signIn("credentials", { username: u, callbackUrl: "/" });
  }
  return (
    <form onSubmit={submit} className="max-w-sm mx-auto p-4 space-y-3">
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
             className="w-full rounded bg-white/10 px-3 py-2 outline-none" />
      <button className="w-full rounded bg-white/10 px-3 py-2">Sign in</button>
    </form>
  );
}
