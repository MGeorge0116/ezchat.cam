"use client";

import { useEffect, useState } from "react";

type Props = { room: string };
type PresenceUser = { id?: string; username?: string; name?: string; email?: string };

export default function UsersList({ room }: Props) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: any;

    const load = async () => {
      try {
        const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const list: PresenceUser[] = data?.users ?? data?.presence ?? [];
          setUsers(Array.isArray(list) ? list : []);
        }
      } catch {}
      setLoading(false);
      timer = setTimeout(load, 5000);
    };

    load();
    return () => clearTimeout(timer);
  }, [room]);

  if (loading && users.length === 0) return <div className="opacity-60 text-sm">Loading…</div>;
  if (users.length === 0) return <div className="opacity-60 text-sm">No one here yet.</div>;

  return (
    <ul className="space-y-2 text-sm">
      {users.map((u, i) => (
        <li key={u.id ?? i} className="truncate">• {u.username || u.name || u.email || "User"}</li>
      ))}
    </ul>
  );
}
