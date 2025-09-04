'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type Tab = 'login' | 'register';

export default function TopAuthBar({ show }: { show: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');

  // shared state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginWelcome, setLoginWelcome] = useState<string | null>(null);

  // register state
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isOver18, setIsOver18] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<string | null>(null);

  if (!show) return null;

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await signIn('credentials', {
        username: loginUsername,
        password: loginPassword,
        redirect: false,
      });
      if (res?.error) {
        setError('Invalid username or password.');
        return;
      }
      setLoginWelcome(loginUsername);
      router.push(`/room/${loginUsername.toLowerCase()}`);
    } finally {
      setBusy(false);
    }
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, isOver18 }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error || 'Registration failed.');
        return;
      }
      // success → remember username and hide form
      setRegisteredUser(username);

      // auto sign-in
      const si = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (si?.error) {
        setError('Account created. Please sign in manually.');
        return;
      }
      router.push(`/room/${username.toLowerCase()}`);
    } catch {
      setError('Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-x-0 top-0 z-40 flex justify-center pt-6 pointer-events-none">
      <div className="w-full max-w-3xl px-4 pointer-events-auto">
        <div className="rounded-2xl border bg-white/95 p-6 shadow-2xl backdrop-blur dark:bg-neutral-900/95">
          {/* Tabs */}
          <div className="mb-4 flex items-center gap-2">
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 ${
                tab === 'login' ? 'bg-gray-50 dark:bg-neutral-800' : ''
              }`}
              onClick={() => {
                setTab('login');
                setError(null);
              }}
            >
              Login
            </button>
            <button
              className={`rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 ${
                tab === 'register' ? 'bg-gray-50 dark:bg-neutral-800' : ''
              }`}
              onClick={() => {
                setTab('register');
                setError(null);
              }}
            >
              Register
            </button>
          </div>

          {/* Content */}
          {tab === 'login' ? (
            loginWelcome ? (
              <div className="py-4 text-center">
                <p className="text-lg font-semibold">Welcome back, {loginWelcome}!</p>
                <p className="text-sm opacity-80">Taking you to your room…</p>
              </div>
            ) : (
              <form onSubmit={doLogin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Username</label>
                  <input
                    className="w-full rounded-lg border px-3 py-2 bg-transparent"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full rounded-lg border px-3 py-2 bg-transparent"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {error && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <div className="md:col-span-2 flex justify-end gap-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {busy ? 'Signing in…' : 'Sign in'}
                  </button>
                </div>
              </form>
            )
          ) : registeredUser ? (
            <div className="py-4 text-center">
              <p className="text-lg font-semibold">Welcome, {registeredUser}!</p>
              <p className="text-sm opacity-80">Your account was created. Redirecting…</p>
            </div>
          ) : (
            <form onSubmit={doRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <p className="mt-1 text-xs opacity-70">3–32 chars: a–z, 0–9, dot, underscore, hyphen.</p>
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border px-3 py-2 bg-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <p className="mt-1 text-xs opacity-70">At least 8 characters.</p>
              </div>

              <label className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4"
                  checked={isOver18}
                  onChange={(e) => setIsOver18(e.target.checked)}
                  required
                />
                <span>I confirm I am 18 or older.</span>
              </label>

              {error && (
                <div className="md:col-span-2">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-60"
                >
                  {busy ? 'Creating…' : 'Create account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
