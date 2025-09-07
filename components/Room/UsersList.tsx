// components/room/UsersList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useBroadcastState } from "./hooks";

type Props = { room: string };
type PresenceUser = { username: string; lastSeen?: string };

function meUsername(): string | null {
  const u =
    localStorage.getItem("auth:username") ||
    localStorage.getItem("profile:username") ||
    localStorage.getItem("ui:username");
  return u ? u.toLowerCase() : null;
}

export default function UsersList({ room }: Props) {
  const me = useMemo(meUsername, []);
  const { isLive, micMuted, deafened } = useBroadcastState(room);

  const [users, setUsers] = useState<PresenceUser[]>([]);

  // Live updates via SSE, with polling fallback
  useEffect(() => {
    let closed = false;

    function ensureMe(list: PresenceUser[]) {
      if (!me) return list;
      if (!list.some((u) => u.username === me)) {
        return [{ username: me }, ...list];
      }
      return list;
    }

    // 1) Try live SSE
    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/presence/stream?room=${encodeURIComponent(room)}`);
      es.addEventListener("update", (evt) => {
        if (closed) return;
        try {
          const data = JSON.parse((evt as MessageEvent).data);
          const list = Array.isArray(data?.users) ? data.users : [];
          setUsers(ensureMe(list));
        } catch {}
      });
      es.onerror = () => {
        // Fallback to polling if SSE errors
        es?.close();
        es = null;
        startPolling();
      };
    } catch {
      startPolling();
    }

    // 2) Polling fallback (2s; slower when tab hidden)
    let pollId: any = null;
    function startPolling() {
      const period = () => (document.hidden ? 8000 : 2000);
      async function tick() {
        try {
          const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, { cache: "no-store" });
          const data = await res.json();
          const list = Array.isArray(data?.users) ? data.users : [];
          if (!closed) setUsers(ensureMe(list));
        } catch {
          // silent failure; next tick will try again
        } finally {
          if (!closed) pollId = setTimeout(tick, period());
        }
      }
      tick();
    }

    return () => {
      closed = true;
      try {
        es?.close();
      } catch {}
      if (pollId) clearTimeout(pollId);
    };
  }, [room, me]);

  // Sort: me on top, then others by lastSeen desc
  const display = useMemo(() => {
    const seen = new Set<string>();
    const dedup = users.filter((u) => {
      const k = (u.username || "").toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const mine = dedup.filter((u) => u.username === me);
    const others = dedup
      .filter((u) => u.username !== me)
      .sort((a, b) => {
        const at = a.lastSeen ? Date.parse(a.lastSeen) : 0;
        const bt = b.lastSeen ? Date.parse(b.lastSeen) : 0;
        return bt - at;
      });

    return [...mine, ...others];
  }, [users, me]);

  return (
    <div className="h-full border border-white/10 rounded-2xl p-3 bg-white/5">
      <div className="text-center text-sm font-semibold tracking-wider mb-3">USERS</div>

      {/* No error banner anymore; silently keeps updating */}
      {display.length === 0 ? (
        <div className="text-xs text-white/60">No one here yet. Share your link!</div>
      ) : (
        <ul className="space-y-2">
          {display.map((u) => {
            const isMe = u.username === me;
            return (
              <li key={u.username} className="truncate text-sm flex items-center gap-2">
                <span className={`truncate ${isMe ? "font-semibold" : ""}`}>
                  {String(u.username || "").toUpperCase() || "UNKNOWN"}
                </span>
                {isMe && (
                  <span className="flex items-center gap-1">
                    {isLive && <Chip className="bg-green-600/80 text-white">LIVE</Chip>}
                    {micMuted && <Chip className="bg-red-600/80 text-white">MIC MUTED</Chip>}
                    {deafened && <Chip className="bg-red-600/80 text-white">DEAFENED</Chip>}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chip({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-[10px] leading-none ${className}`}>{children}</span>;
}
