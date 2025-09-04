'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function UserMenu({
  signedIn,
  displayName,
  avatarUrl,
}: {
  signedIn: boolean;
  displayName: string;
  avatarUrl?: string;
}) {
  if (!signedIn) return null;

  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          width={28}
          height={28}
          className="rounded-full border"
          style={{ display: 'block' }}
        />
      ) : (
        <div className="rounded-full border px-2 py-1 text-xs opacity-70">
          {displayName.slice(0, 2).toUpperCase()}
        </div>
      )}

      <span className="text-sm">{displayName}</span>

      <Link
        href={`/room/${displayName.toLowerCase()}`}
        className="rounded-xl border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        My Room
      </Link>

      <button
        className="rounded-xl border px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        Sign out
      </button>
    </div>
  );
}
