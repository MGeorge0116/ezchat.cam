'use client';

import * as React from 'react';

type Props = { room: string };

type PresenceUser = {
  username: string;
  lastSeen: string; // ISO string
  isLive: boolean;
};

type PresenceResponse = {
  users: PresenceUser[];
};

export default function UsersList({ room }: Props) {
  const [users, setUsers] = React.useState<PresenceUser[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchUsers = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load presence');
      const data = (await res.json()) as PresenceResponse;
      setUsers(Array.isArray(data?.users) ? data.users : []);
    } catch {
      // keep previous list on transient errors
    } finally {
      setLoading(false);
    }
  }, [room]);

  React.useEffect(() => {
    setLoading(true);
    fetchUsers();
    const id = setInterval(fetchUsers, 15_000);
    return () => clearInterval(id);
  }, [fetchUsers]);

  if (loading && users.length === 0) {
    return <div className="p-3 text-sm opacity-70">Loading users…</div>;
  }

  if (users.length === 0) {
    return <div className="p-3 text-sm opacity-70">No one is here yet.</div>;
  }

  return (
    <ul className="p-3 space-y-2">
      {users.map((u) => {
        const lastSeen = new Date(u.lastSeen);
        const last = isNaN(+lastSeen) ? '' : lastSeen.toLocaleTimeString();
        return (
          <li
            key={u.username}
            className="flex items-center justify-between rounded-md border px-2 py-1"
          >
            <span className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  u.isLive ? 'bg-green-500' : 'bg-gray-400'
                }`}
                aria-label={u.isLive ? 'live' : 'offline'}
              />
              <span className="font-medium">{u.username}</span>
            </span>
            <span className="ml-2 flex shrink-0 items-center gap-2 text-xs opacity-80">
              {last && <span>Last seen: {last}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
