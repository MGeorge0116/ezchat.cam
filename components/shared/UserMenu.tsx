// File: components/shared/UserMenu.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function UserMenu({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-xl bg-white text-black px-3 py-1.5 text-xs font-semibold"
      >
        {username.toUpperCase()} ▾
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-xl bg-black/80 ring-1 ring-white/10 p-1 text-sm text-white"
          onMouseLeave={() => setOpen(false)}
        >
          <Link className="block rounded-md px-3 py-2 hover:bg-white/10" href="/my">
            My Room
          </Link>
          <Link className="block rounded-md px-3 py-2 hover:bg-white/10" href="/profile">
            My Profile
          </Link>
          <button className="block w-full text-left rounded-md px-3 py-2 hover:bg-white/10">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
