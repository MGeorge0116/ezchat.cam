'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isOver18, setIsOver18] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // track success state
  const [registeredUser, setRegisteredUser] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, isOver18 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Registration failed.');
        setBusy(false);
        return;
      }

      // mark success: store username, hide form
      setRegisteredUser(username);

      // auto sign in
      const si = await signIn('credentials', { username, password, redirect: false });
      if (si?.error) {
        setError('Account created. Please sign in manually.');
        setBusy(false);
        return;
      }

      // after sign-in redirect
      router.push(`/room/${username.toLowerCase()}`);
    } catch {
      setError('Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-20"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Create account</h2>
          <button
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* show success message or form */}
        {registeredUser ? (
          <div className="text-center py-6">
            <p className="text-lg font-semibold mb-2">
              Welcome, {registeredUser}!
            </p>
            <p className="text-sm opacity-80">
              Your account has been created. Redirecting you to your room…
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                autoComplete="username"
                required
              />
              <p className="mt-1 text-xs opacity-70">
                3–32 chars: a–z, 0–9, dot, underscore, hyphen.
              </p>
            </div>

            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                className="w-full rounded-lg border px-3 py-2 bg-transparent"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
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
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              <p className="mt-1 text-xs opacity-70">At least 8 characters.</p>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4"
                checked={isOver18}
                onChange={(e) => setIsOver18(e.target.checked)}
                required
              />
              <span>I confirm I am 18 or older.</span>
            </label>

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
                {busy ? 'Creating…' : 'Create account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
