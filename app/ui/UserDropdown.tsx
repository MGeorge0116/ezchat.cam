// app/ui/UserDropdown.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface Props { displayName: string; }

export default function UserDropdown({ displayName }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const label = (displayName ?? "").toString().toUpperCase(); // ⬅️ all caps for UI

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="dd" ref={ref}>
      <button
        className="dd-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="dd-name">{label}</span>
        <span className="caret">▼</span>
      </button>

      {open && (
        <div className="dd-menu" role="menu">
          <div className="dd-head">{label}</div>
          {/* keep route param as the original (not uppercased) */}
          <Link
            href={`/room/${displayName}`}
            className="dd-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My Room
          </Link>
          <Link
            href="/profile"
            className="dd-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>
          <Link
            href="/settings"
            className="dd-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            className="dd-item dd-danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
