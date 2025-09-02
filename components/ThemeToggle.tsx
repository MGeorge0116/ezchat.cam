// web/components/ThemeToggle.tsx
'use client';

import React from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const [theme, setTheme] = React.useState<Theme>('dark');

  // On mount, pick saved theme or system preference
  React.useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme | null);
    const preferred: Theme =
      saved ??
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark');

    setTheme(preferred);
    const html = document.documentElement;
    html.setAttribute('data-theme', preferred);
    html.setAttribute('data-has-theme', '1'); // mark that we chose a theme
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    const html = document.documentElement;
    html.setAttribute('data-theme', next);
    html.setAttribute('data-has-theme', '1');
    localStorage.setItem('theme', next);
  };

  const label = theme === 'dark' ? 'Light' : 'Dark';
  const icon = theme === 'dark' ? '☀️' : '🌙';

  // Avoid mismatched icon during SSR
  return (
    <button
      className="btn"
      aria-pressed={theme === 'dark' ? 'true' : 'false'}
      title="Toggle theme"
      onClick={toggle}
    >
      <span className="toggle-icon" aria-hidden>{mounted ? icon : '🌓'}</span>
      <span>{mounted ? `${label} Mode` : 'Theme'}</span>
    </button>
  );
}
