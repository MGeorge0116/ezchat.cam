// components/ui/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // Avoid hydration mismatch
    return (
      <button
        className="px-2 py-1 rounded-lg text-xs bg-white/10"
        aria-label="Toggle theme"
      >
        …
      </button>
    );
  }

  const isDark = (theme ?? "dark") === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="px-3 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/20"
      aria-label="Toggle theme"
      title={isDark ? "Dark" : "Light"}
    >
      {isDark ? "Dark" : "Light"}
    </button>
  );
}
