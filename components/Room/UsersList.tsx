"use client";

import { useEffect, useState } from "react";

type User = { username: string; lastSeen: string; isLive?: boolean };

export default function UsersList({ room }: { room: string }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let closed = false;

    async function fetchList() {
      try {
        const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, { cache: "no-store" });
        const data = await res.json();
        if (!closed) setUsers(data?.users || []);
      } catch {}
    }

    fetchList();
    const id = setInterval(fetchList, 3000);
    return () => { closed = true; clearInterval(id); };
  }, [room]);

  return (
    <div className="h-full border border-white/10 rounded-2xl p-3 bg-white/5 flex flex-col">
      <div className="text-center text-sm font-semibold tracking-wider mb-3">USERS</div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
        {users.length === 0 ? (
          <div className="text-xs opacity-70">No one here yet. Share your link!</div>
        ) : users.map((u) => (
          <div key={u.username} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ background: u.isLive ? "#22c55e" : "rgba(255,255,255,.3)" }} />
            <div className="truncate">{u.username.toUpperCase()}</div>
            {u.isLive && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-green-600">LIVE</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
