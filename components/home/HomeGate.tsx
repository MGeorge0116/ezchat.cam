// components/home/HomeGate.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";
import { useSearchParams } from "next/navigation";

export default function HomeGate() {
  const [knownUser, setKnownUser] = useState<string | null>(null);
  const params = useSearchParams();
  const authRequired = useMemo(() => params.get("auth") === "required", [params]);

  useEffect(() => {
    const u =
      localStorage.getItem("auth:username") ||
      localStorage.getItem("profile:username") ||
      localStorage.getItem("ui:username");
    setKnownUser(u && u.trim() ? u : null);
  }, []);

  if (knownUser) {
    // Signed user → do NOT show any "we don't know your username" message.
    // Also hide the auth card entirely.
    return null;
  }

  // Unsigned user → show the login/register card (top of page),
  // while the directory continues to render below.
  return (
    <div className="w-full flex items-center justify-center pt-6 pb-4">
      <div className="w-full max-w-md">
        {authRequired ? (
          <div className="mb-3 text-center text-sm opacity-80">
            Sign in (or register) to join chat rooms.
          </div>
        ) : null}
        <AuthCard />
      </div>
    </div>
  );
}
