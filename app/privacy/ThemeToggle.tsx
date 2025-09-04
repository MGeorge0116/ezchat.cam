"use client";

import React from "react";

const STORAGE_KEY = "ezchat-theme"; // "light" | "dark"

function applyTheme(t: "light" | "dark") {
  if (t === "light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    // initialize from storage or prefers-color-scheme
    const saved = (localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null);
    const initial =
      saved ??
      (window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      className="btn small"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
    >
      {theme === "light" ? "Dark Mode" : "Light Mode"}
    </button>
  );
}
