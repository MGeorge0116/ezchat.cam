'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterController() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, isOver18 }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Registration failed.");
      return;
    }

    // Auto sign in after register
    const signin = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (signin?.error) {
      setError("Account created. Please sign in manually.");
      return;
    }

    router.push(`/room/${username.toLowerCase()}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isOver18} onChange={e => setIsOver18(e.target.checked)} />
        <span>I am 18 or older</span>
      </label>
      <button type="submit">Register</button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
