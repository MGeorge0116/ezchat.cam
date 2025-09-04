// components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

/**
 * Simple theme toggle:
 * - Applies 'dark' class to <html> and stores preference in localStorage.
 * - Button label shows the mode you will switch TO (matches your screenshot).
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize from localStorage or system preference
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const startDark = stored ? stored === "dark" : prefersDark;
    setIsDark(startDark);
    document.documentElement.classList.toggle("dark", startDark);
    document.documentElement.setAttribute("data-theme", startDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className="rounded-md border border-slate-300/70 dark:border-white/20 px-3 py-1 text-sm bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
