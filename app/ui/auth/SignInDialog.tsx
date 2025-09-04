'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignInDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    const res = await signIn('credentials', { username, password, redirect: false });
    setBusy(false);

    if (res?.error) {
      setError('Invalid username or password.');
      return;
    }

    onClose();
    router.push(`/room/${username.toLowerCase()}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-20" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sign in</h2>
          <button
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={doSignIn} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              className="w-full rounded-lg border px-3 py-2 bg-transparent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              className="w-full rounded-lg border px-3 py-2 bg-transparent"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:hover:bg-neutral-800"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
