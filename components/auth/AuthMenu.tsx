// components/auth/AuthMenu.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { localLogoutCleanup } from "@/lib/client/logout";

export default function AuthMenu() {
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    try {
      await localLogoutCleanup();
      await signOut({ redirect: false });
    } finally {
      window.location.replace("/");
    }
  }

  const username =
    (typeof window !== "undefined" &&
      (localStorage.getItem("auth:username") ||
        localStorage.getItem("profile:username") ||
        localStorage.getItem("ui:username"))) ||
    "";

  const router = useRouter();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-sm"
      >
        {username ? username.toUpperCase() : "ACCOUNT"}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-2 z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <MenuItem onClick={() => router.push("/my")}>My Room</MenuItem>
          <MenuItem onClick={() => router.push("/profile")}>My Profile</MenuItem>
          <MenuItem onClick={() => router.push("/settings")}>Settings</MenuItem>
          <div className="h-px my-1 bg-white/10" />
          <MenuItem danger onClick={handleSignOut}>
            Sign out
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
        danger ? "bg-red-600/80 hover:bg-red-600 text-white" : "hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
