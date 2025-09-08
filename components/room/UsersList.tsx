"use client";

import { useEffect, useRef, useState } from "react";

type RoomUser = { id?: string; username: string };

export default function UsersList({ room }: { room: string }) {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const timerRef = useRef<number | null>(null);

  async function fetchUsers() {
    // Primary: members route driven by your heartbeat
    const url = `/api/rooms/${encodeURIComponent(room)}/members`;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.users)) {
          setUsers(json.users as RoomUser[]);
          return;
        }
      }
    } catch {}
    // Fallback: show empty quietly
    setUsers([]);
  }

  useEffect(() => {
    fetchUsers();
    timerRef.current = window.setInterval(fetchUsers, 5000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [room]);

  if (!users.length) {
    return (
      <ul className="space-y-1">
        <li className="opacity-80 text-[12px]">No one here yet.</li>
      </ul>
    );
  }

  return (
    <ul className="space-y-1">
      {users.map((u, i) => (
        <li
          key={u.id ?? `${u.username}-${i}`}
          className="flex items-center gap-1.5 text-[12px] leading-tight"
          title={u.username}
        >
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_2px_rgba(0,0,0,0.25)]"
            aria-hidden
          />
          <span className="truncate max-w-[calc(var(--user-rail-w,112px)-16px)]">
            {u.username}
          </span>
        </li>
      ))}
    </ul>
  );
}
