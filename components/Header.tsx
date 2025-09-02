"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="w-full border-b border-white/10 bg-[rgb(19,19,20)] text-white">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          EZChat
        </Link>

        <div className="flex items-center gap-3">
          {session?.user?.name ? (
            <>
              <Link
                href={`/profile/${encodeURIComponent(session.user.name)}`}
                className="text-sm text-white/90 hover:underline"
              >
                Welcome, {session.user.name}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs rounded-md bg-white/10 hover:bg-white/15 px-3 py-1.5"
              >
                Sign out
              </button>
            </>
          ) : (
            <span className="text-sm text-white/60">Not signed in</span>
          )}
        </div>
      </div>
    </header>
  );
}
