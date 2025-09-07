'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/shared/ThemeToggle';
import UserMenu from '@/components/shared/UserMenu';
import { useMemo } from 'react';

export default function SiteHeader({ username }: { username?: string }) {
  const pathname = usePathname();

  // When on /room/[username], show the room name in the header center.
  const centerTitle = useMemo(() => {
    if (!pathname?.startsWith('/room/')) return null;
    const slug = pathname.split('/').pop() || '';
    return slug.toUpperCase(); // No "ROOM:" prefix
  }, [pathname]);

  return (
    <header className="w-full border-b border-black/10 dark:border-white/10">
      {/* Full-bleed header: brand flush left, controls flush right, title centered */}
      <div className="w-full h-14 grid grid-cols-3 items-center px-0">
        {/* LEFT: Brand */}
        <div className="flex items-center pl-0">
          <Link href="/" className="flex items-center gap-2 font-extrabold tracking-wide">
            <span className="text-slate-900 dark:text-white">EZChat.Cam</span>
          </Link>
        </div>

        {/* CENTER: Room Name (only on /room/[username]) */}
        <div className="flex items-center justify-center">
          {centerTitle && (
            <div className="text-slate-900 dark:text-white/90 font-extrabold tracking-wide text-sm sm:text-base">
              {centerTitle}
            </div>
          )}
        </div>

        {/* RIGHT: Theme toggle + user menu */}
        <div className="flex items-center justify-end gap-3 pr-2">
          <ThemeToggle />
          {username ? (
            <UserMenu username={username} />
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-black text-xs font-semibold"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
