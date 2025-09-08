"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthMenu() {
  const { data } = useSession();
  const name = data?.user?.name?.toString().toLowerCase();

  if (!name) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => signIn()}
          className="text-xs rounded-md bg-white/10 px-2 py-1"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="text-xs rounded-md bg-white/10 px-2 py-1">
        {name.toUpperCase()}
      </button>
      <div className="absolute right-0 mt-1 hidden group-hover:block bg-black/80 border border-white/10 rounded-md min-w-[160px]">
        <Link href={`/room/${name}`} className="block px-3 py-2 text-sm hover:bg-white/10">My Room</Link>
        <button onClick={() => signOut()} className="block w-full text-left px-3 py-2 text-sm hover:bg-white/10">
          Sign out
        </button>
      </div>
    </div>
  );
}
