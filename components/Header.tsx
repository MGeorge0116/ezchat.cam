'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const [username, setUsername] = useState<string>('SEYMOUR');
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try {
      const u =
        localStorage.getItem('auth:username') ||
        localStorage.getItem('profile:username') ||
        'SEYMOUR';
      setUsername(u);
    } catch {}
  }, []);

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 backdrop-blur bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center">
        <Link href="/" className="font-extrabold tracking-wide">
          EZChat.Cam
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setDark((v) => !v)}
            className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm"
          >
            {dark ? 'Dark' : 'Light'}
          </button>

          <div className="relative">
            <details className="group">
              <summary className="list-none select-none cursor-pointer px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sm">
                {username.toUpperCase()} ▾
              </summary>
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#0b0f14] ring-1 ring-white/10 shadow-lg p-2">
                <Link className="block px-3 py-2 rounded-md hover:bg-white/10" href="/my">
                  My Room
                </Link>
                <Link className="block px-3 py-2 rounded-md hover:bg-white/10" href="/profile">
                  My Profile
                </Link>
                <button
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-white/10"
                  onClick={() => {
                    try {
                      localStorage.removeItem('auth:username');
                      location.reload();
                    } catch {}
                  }}
                >
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
