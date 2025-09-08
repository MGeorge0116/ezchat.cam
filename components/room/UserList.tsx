"use client";

import { useEffect, useState } from "react";

type Props = { room: string };

type PresenceUser = {
  username: string;
  lastSeen: string;
};

export default function UsersList({ room }: Props) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (alive) setUsers(data.users || []);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load users");
      }
    }

    load();
    const id = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [room]);

  return (
    <div className="h-full border border-white/10 rounded-2xl p-3 bg-white/5">
      <div className="text-center text-sm font-semibold tracking-wider mb-3">USERS</div>
      {err && (
        <div className="text-xs text-red-400 mb-2">Couldn&apos;t load users. Showing last known list.</div>
      )}
      {users.length === 0 ? (
        <div className="text-xs text-white/60">No one here yet. Share your link!</div>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.username} className="truncate text-sm">
              {u.username.toUpperCase()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
