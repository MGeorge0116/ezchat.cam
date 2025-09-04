// components/AuthMenu.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close when route changes
  useEffect(() => setOpen(false), [pathname]);

  // Close on outside click + Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // TODO: replace with your NextAuth session username
  const username = useMemo(() => "SEYMOUR", []);
  const slug = username.toLowerCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-md border border-slate-300/70 dark:border-white/20 px-3 py-1 text-sm bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20"
      >
        {username.toUpperCase()}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1220] shadow-lg p-2 text-sm"
        >
          <MenuLink href={`/room/${slug}`} onSelect={() => setOpen(false)}>
            My Room
          </MenuLink>
          <MenuLink href="/profile" onSelect={() => setOpen(false)}>
            Profile
          </MenuLink>
          <MenuLink href="/settings" onSelect={() => setOpen(false)}>
            Settings
          </MenuLink>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onSelect,
  children,
}: {
  href: string;
  onSelect?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10"
      onClick={onSelect}
    >
      {children}
    </Link>
  );
}
