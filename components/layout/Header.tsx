"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function getUsername(): string | null {
  try {
    return (
      localStorage.getItem("auth:username") ||
      localStorage.getItem("profile:username") ||
      null
    );
  } catch { return null; }
}

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setUsername(getUsername());
    const t = (localStorage.getItem("ui:theme") as "dark" | "light") || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("ui:theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    } catch {}
  }

  function signOut() {
    try {
      localStorage.removeItem("auth:username");
      localStorage.removeItem("profile:username");
      localStorage.removeItem("profile:desc");
      setUsername(null);
      window.location.href = "/";
    } catch {}
  }

  return (
    <header className="sticky top-0 z-40 bg-black/30 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* brand far left */}
        <Link href="/" className="font-bold tracking-wide">EZChat.Cam</Link>

        {/* far right controls */}
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="text-xs rounded-md bg-white/10 px-2 py-1">
            {theme === "dark" ? "Dark" : "Light"}
          </button>

          {username ? (
            <div className="relative group">
              <button className="text-xs rounded-md bg-white/10 px-2 py-1">{username.toUpperCase()}</button>
              <div className="absolute right-0 mt-1 hidden group-hover:block bg-black/80 border border-white/10 rounded-md min-w-[160px]">
                <Link href={`/room/${username}`} className="block px-3 py-2 text-sm hover:bg-white/10">My Room</Link>
                <button onClick={signOut} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">Sign out</button>
              </div>
            </div>
          ) : (
            <AuthInline onLogin={(u) => setUsername(u)} />
          )}
        </div>
      </div>
    </header>
  );
}

function AuthInline({ onLogin }: { onLogin: (u: string) => void }) {
  const [name, setName] = useState("");

  function submit() {
    const u = name.trim().toLowerCase();
    if (!u) return;
    try {
      localStorage.setItem("auth:username", u);
      localStorage.setItem("profile:username", u);
      onLogin(u);
      window.location.reload();
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <input
        className="rounded-md bg-white/10 px-2 py-1 text-sm"
        placeholder="username"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={submit} className="text-xs rounded-md bg-white/10 px-2 py-1">Sign in</button>
    </div>
  );
}
