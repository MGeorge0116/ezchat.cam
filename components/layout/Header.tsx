// components/layout/Header.tsx
"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AuthMenu from "@/components/auth/AuthMenu";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 sticky top-0 z-40 bg-black/30 backdrop-blur">
      {/* Full-bleed row (no max-width container) */}
      <div className="w-full h-12 flex items-center px-3 sm:px-4">
        {/* Brand hard-left */}
        <Link
          href="/"
          className="font-semibold tracking-wide shrink-0"
          aria-label="EZChat.Cam Home"
        >
          EZChat.Cam
        </Link>

        {/* Hard-right controls */}
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <AuthMenu />
        </div>
      </div>
    </header>
  );
}
