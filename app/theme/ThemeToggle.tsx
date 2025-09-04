// app/theme/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dark";

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Mode | null;
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      apply(stored || (prefersDark ? "dark" : "light"));
    } catch {
      apply("light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function apply(next: Mode) {
    setMode(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  }

  return (
    <button type="button" className="mode-btn" onClick={() => apply(mode === "dark" ? "light" : "dark")} aria-label="Toggle color mode">
      <span className="mode-emoji">{mode === "dark" ? "🌙" : "☀️"}</span>
      <span>{mode === "dark" ? "Dark Mode" : "Light Mode"}</span>
    </button>
  );
}
