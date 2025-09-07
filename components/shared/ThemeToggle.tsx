'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // avoid hydration mismatch

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5
                 bg-white text-slate-900 ring-1 ring-black/10 hover:bg-slate-100
                 dark:bg-white/10 dark:text-white dark:ring-white/10 dark:hover:bg-white/20
                 transition"
    >
      <span className="text-base leading-none">{isDark ? '🌙' : '☀️'}</span>
      <span className="text-xs font-semibold">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
