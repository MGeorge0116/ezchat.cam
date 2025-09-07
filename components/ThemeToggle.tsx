"use client";

import { useEffect, useState } from "react";

type Props = { className?: string; title?: string };

export default function ThemeToggle({ className, title }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    let nextDark = true;
    if (stored === "light") nextDark = false;
    else if (stored === "dark") nextDark = true;
    else if (root.classList.contains("dark")) nextDark = true;
    else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) nextDark = true;

    setIsDark(nextDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        title={title ?? "Toggle theme"}
        className={`rounded-xl border border-white/20 px-2 py-2 ${className ?? ""}`}
      >
        🌓
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsDark(v => !v)}
      aria-label="Toggle theme"
      title={title ?? (isDark ? "Switch to light mode" : "Switch to dark mode")}
      className={`rounded-xl border border-white/20 px-2 py-2 hover:border-white/40 active:translate-y-[0.5px] ${className ?? ""}`}
    >
      <span className="sr-only">Toggle theme</span>
      <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
    </button>
  );
}
