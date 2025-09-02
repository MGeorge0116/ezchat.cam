// web/components/AuthMenu.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const ROOM_BASE_PATH = '/room'; // ← change to '/chat' if your route is /chat/[room]

export default function AuthMenu() {
  const { status, data } = useSession();
  const user = (data?.user || {}) as { username?: string; name?: string; email?: string };
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click / ESC
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keyup', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keyup', onKey);
    };
  }, []);

  if (status === 'loading') {
    return <button className="btn" disabled>Loading…</button>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="toolbar" style={{ gap: 8 }}>
        <Link className="btn" href="/auth/login">Sign in</Link>
        <Link className="btn" href="/auth/register">Register</Link>
      </div>
    );
  }

  // Build "<username> (email)" label + room slug
  const uname = user.username || user.name || (user.email ? user.email.split('@')[0] : 'Account');
  const label = user.email ? `${uname} (${user.email})` : uname;

  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'me';

  const slugSource = user.username || (user.email ? user.email.split('@')[0] : 'me');
  const roomSlug = encodeURIComponent(slugify(slugSource));

  return (
    <div ref={menuRef} className="toolbar" style={{ position: 'relative' }}>
      <button
        className="btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((s) => !s)}
        title={label}
      >
        <span>{label}</span>
        <span className="caret">▾</span>
      </button>

      {open && (
        <div
          id="account-menu"
          role="menu"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            minWidth: 220,
            background: 'var(--panel)',
            color: 'var(--text)',
            border: '1px solid var(--edge)',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,.25)',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          <div style={{ padding: 10, borderBottom: '1px solid var(--edge)', fontSize: 12, color: 'var(--muted)' }}>
            Signed in as<br /><strong style={{ color: 'var(--text)' }}>{label}</strong>
          </div>

          {/* FIRST ITEM: My Room */}
          <MenuLink href={`${ROOM_BASE_PATH}/${roomSlug}`} onNavigate={() => setOpen(false)}>
            My Room
          </MenuLink>

          <MenuLink href="/me" onNavigate={() => setOpen(false)}>Profile</MenuLink>
          <MenuLink href="/settings" onNavigate={() => setOpen(false)}>Settings</MenuLink>

          <div style={{ borderTop: '1px solid var(--edge)' }} />

          <button
            role="menuitem"
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
            style={itemStyle(true)}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onNavigate}
      style={itemStyle()}
      className="menu-link"
    >
      {children}
    </Link>
  );
}

function itemStyle(danger = false): React.CSSProperties {
  return {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 14,
    color: danger ? '#fca5a5' : 'var(--text)',
    textDecoration: 'none',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  };
}
