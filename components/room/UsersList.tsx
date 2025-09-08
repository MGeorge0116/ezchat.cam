"use client";

import * as React from "react";

export interface UsersListProps {
  room: string;
  className?: string;
}

type Member = {
  username: string;
  isLive?: boolean;
  muted?: boolean;
  deafened?: boolean;
};

type MembersResponse = { users: Member[] } | Member[];

export default function UsersList({ room, className }: UsersListProps) {
  const [users, setUsers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(room)}/members`, {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error(`Failed to load members (${res.status})`);
      const data: MembersResponse = await res.json();

      // Accept both shapes: { users: [...] } or [...]
      const list = Array.isArray(data) ? data : data.users;
      setUsers(
        (list ?? []).map((u) => ({
          username: u.username,
          isLive: u.isLive ?? false,
          muted: u.muted ?? false,
          deafened: u.deafened ?? false,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [room]);

  React.useEffect(() => {
    void fetchUsers();
    const id = setInterval(fetchUsers, 10_000); // lightweight polling
    return () => clearInterval(id);
  }, [fetchUsers]);

  return (
    <div className={`flex h-full flex-col ${className ?? ""}`}>
      {loading && users.length === 0 ? (
        <div className="py-4 text-center text-sm opacity-70">Loading…</div>
      ) : error ? (
        <div className="py-4 text-center text-sm text-red-400">Error: {error}</div>
      ) : users.length === 0 ? (
        <div className="py-4 text-center text-sm opacity-70">No users in this room.</div>
      ) : (
        <ul className="space-y-1">
          {users.map((u) => (
            <li
              key={u.username}
              className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-neutral-800/50"
              title={u.username}
            >
              <span className="truncate text-sm font-medium">
                {u.username.toUpperCase()}
              </span>
              <span className="ml-2 flex shrink-0 items-center gap-2 text-xs opacity-80">
                {u.is
