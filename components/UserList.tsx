"use client";

import React, { useEffect, useMemo, useState } from "react";

type CurrentUser = { name?: string | null; email?: string | null; id?: string | null };
type PresenceUser = { id: string; username?: string | null; micOn?: boolean; broadcasting?: boolean };

type Props = { room: string; currentUser?: CurrentUser };

export default function UserList({ room, currentUser }: Props) {
  const [remoteUsers, setRemoteUsers] = useState<PresenceUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    async function refresh() {
      try {
        const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, {
          headers: { "cache-control": "no-store" },
        });
        const data = (await res.json()) as { users?: PresenceUser[] };
        if (live) setRemoteUsers(Array.isArray(data?.users) ? data.users : []);
      } catch {
        if (live) setRemoteUsers([]);
      }
    }
    refresh();
    const t = setInterval(refresh, 5000);
    return () => { live = false; clearInterval(t); };
  }, [room]);

  const you: PresenceUser | null = useMemo(() => {
    const name  = currentUser?.name  ?? undefined;
    const email = currentUser?.email ?? undefined;
    if (!name && !email) return null;
    return {
      id: (currentUser?.id || email || name || "you").toString(),
      username: name || email || "You",
      broadcasting: false,
      micOn: false,
    };
  }, [currentUser]);

  const users: PresenceUser[] = useMemo(() => {
    const list = [...remoteUsers];
    if (you) {
      const exists = list.some(u => (u.id ?? "").toString() === (you.id ?? "").toString());
      if (!exists) list.unshift(you);
      else {
        const idx = list.findIndex(u => (u.id ?? "").toString() === (you.id ?? "").toString());
        if (idx > -1) {
          const [mine] = list.splice(idx, 1);
          list.unshift({ ...mine, username: you.username });
        }
      }
    }
    const seen = new Set<string>(), out: PresenceUser[] = [];
    for (const u of list) {
      const id = (u.id ?? "").toString();
      if (!seen.has(id)) { seen.add(id); out.push(u); }
    }
    return out;
  }, [remoteUsers, you]);

  const onClickUser = (u: PresenceUser) => setSelectedId((u.id ?? "").toString());
  const onDoubleClickUser = (u: PresenceUser) => {
    window.dispatchEvent(new CustomEvent("ezcam:dm", { detail: { toId: u.id, toName: u.username } }));
  };

  return (
    <div className="p-4 text-sm">
      <div className="mb-2 font-semibold">Users{users.length ? ` (${users.length})` : ""}</div>

      {users.length === 0 ? (
        <div className="text-white/50">No users online.</div>
      ) : (
        <div className="space-y-1">
          {users.map(u => {
            const id = (u.id ?? "").toString();
            const isYou = you && id === (you.id ?? "").toString();
            const selected = selectedId === id;
            return (
              <div
                key={id}
                onClick={() => onClickUser(u)}
                onDoubleClick={() => onDoubleClickUser(u)}
                className={[
                  "flex items-center justify-between rounded-md px-2 py-1 cursor-pointer transition-colors",
                  selected ? "bg-white/10" : "hover:bg-white/5",
                ].join(" ")}
                title={isYou ? "This is you" : u.username || id}
              >
                <span className={["truncate", isYou ? "font-semibold text-sky-400" : ""].join(" ")}>
                  {isYou ? `${u.username || "You"} (You)` : u.username || id}
                </span>

                <div className="flex items-center gap-1">
                  {u.broadcasting ? (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300">live</span>
                  ) : null}
                  {u.micOn ? (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-300">mic</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
