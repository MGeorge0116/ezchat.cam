"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import AuthMenu from "@/components/auth/AuthMenu";

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const t = (localStorage.getItem("ui:theme") as "dark" | "light") || "dark";
    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("ui:theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
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
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
