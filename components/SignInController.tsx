'use client';

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInController() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid username or password.");
      return;
    }

    router.push(`/room/${username.toLowerCase()}`);
  }

  // Replace these <input> fields with your styled UI if needed
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Sign In</button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
