// components/room/ChatPanel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = { room: string };
type ChatMessage = { id: string; room: string; username: string; text: string; ts: number };

const ACTIVE_KEY = "chat:active"; // { room, tabId, ts }
const ACTIVE_TTL_MS = 15000;      // consider a lock alive if refreshed within 15s

function currentUsername(): string {
  return (
    localStorage.getItem("auth:username") ||
    localStorage.getItem("profile:username") ||
    localStorage.getItem("ui:username") ||
    "me"
  ).toLowerCase();
}
function myTabId(): string {
  let id = sessionStorage.getItem("chat:tabid");
  if (!id) {
    id = `tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("chat:tabid", id);
  }
  return id;
}

export default function ChatPanel({ room }: Props) {
  const me = useMemo(currentUsername, []);
  const tabId = useMemo(myTabId, []);
  const [blockedBy, setBlockedBy] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const joinTsRef = useRef<number>(Date.now()); // used to filter polling to post-join only
  const ownsLockRef = useRef(false);
  const heartbeatIdRef = useRef<any>(null);

  // ==== Single-room guard (cross-tab lock via localStorage) ====
  useEffect(() => {
    function readLock() {
      try {
        const raw = localStorage.getItem(ACTIVE_KEY);
        return raw ? JSON.parse(raw) as { room: string; tabId: string; ts: number } : null;
      } catch { return null; }
    }
    function writeLock(value: { room: string; tabId: string; ts: number }) {
      try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(value)); } catch {}
    }
    function clearLock() {
      try {
        const cur = readLock();
        if (cur && cur.tabId === tabId) localStorage.removeItem(ACTIVE_KEY);
      } catch {}
    }
    function tryAcquire() {
      const cur = readLock();
      const now = Date.now();
      if (!cur || now - cur.ts > ACTIVE_TTL_MS) {
        // stale or empty -> acquire
        ownsLockRef.current = true;
        setBlockedBy(null);
        writeLock({ room: room.toLowerCase(), tabId, ts: now });
        // heartbeat to keep lock fresh
        heartbeatIdRef.current = setInterval(() => {
          const cur2 = readLock();
          if (cur2 && cur2.tabId === tabId) {
            writeLock({ ...cur2, ts: Date.now(), room: room.toLowerCase() });
          }
        }, 4000);
        return;
      }
      // someone holds an active lock
      if (cur.room !== room.toLowerCase() || cur.tabId !== tabId) {
        ownsLockRef.current = false;
        setBlockedBy(cur.room);
        return;
      }
      // same tab/room -> take over & refresh
      ownsLockRef.current = true;
      setBlockedBy(null);
      writeLock({ ...cur, ts: now, room: room.toLowerCase(), tabId });
      heartbeatIdRef.current = setInterval(() => {
        const cur2 = readLock();
        if (cur2 && cur2.tabId === tabId) {
          writeLock({ ...cur2, ts: Date.now(), room: room.toLowerCase() });
        }
      }, 4000);
    }

    tryAcquire();

    // react to external tab changing the lock
    function onStorage(e: StorageEvent) {
      if (e.key !== ACTIVE_KEY) return;
      const cur = (() => { try { return e.newValue ? JSON.parse(e.newValue) : null; } catch { return null; }})();
      const now = Date.now();
      if (!cur || now - cur.ts > ACTIVE_TTL_MS) {
        // stale/cleared -> try to acquire again
        if (!ownsLockRef.current) tryAcquire();
        return;
      }
      if (cur.tabId !== tabId || cur.room !== room.toLowerCase()) {
        // some other room/tab owns it
        ownsLockRef.current = false;
        setBlockedBy(cur.room);
      } else {
        ownsLockRef.current = true;
        setBlockedBy(null);
      }
    }
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      if (heartbeatIdRef.current) clearInterval(heartbeatIdRef.current);
      // release lock if we own it
      try {
        const raw = localStorage.getItem(ACTIVE_KEY);
        const cur = raw ? JSON.parse(raw) : null;
        if (cur && cur.tabId === tabId) localStorage.removeItem(ACTIVE_KEY);
      } catch {}
    };
  }, [room, tabId]);

  // ==== Live updates (SSE) — no history on join ====
  useEffect(() => {
    if (blockedBy) return;   // don’t join stream if blocked
    joinTsRef.current = Date.now();
    setMessages([]);         // fresh on join

    let closed = false;
    let es: EventSource | null = null;

    try {
      es = new EventSource(`/api/chat/stream?room=${encodeURIComponent(room)}`);
      // NOTE: we IGNORE the "history" event to start fresh
      es.addEventListener("message", (evt) => {
        if (closed) return;
        const m = JSON.parse((evt as MessageEvent).data) as ChatMessage;
        append(m);
      });
      es.onerror = () => {
        es?.close();
        es = null;
        pollForNewOnly();
      };
    } catch {
      pollForNewOnly();
    }

    // polling fallback: fetch full history but only append messages newer than join time
    let pollId: any = null;
    function pollForNewOnly() {
      async function tick() {
        try {
          const res = await fetch(`/api/chat/history?room=${encodeURIComponent(room)}&limit=120`, { cache: "no-store" });
          const data = await res.json();
          const since = joinTsRef.current;
          const arr = (data?.messages || []).filter((m: ChatMessage) => (m?.ts || 0) > since);
          if (!closed && arr.length) append(arr);
        } catch {}
        finally {
          if (!closed) pollId = setTimeout(tick, document.hidden ? 8000 : 3000);
        }
      }
      tick();
    }

    return () => {
      closed = true;
      try { es?.close(); } catch {}
      if (pollId) clearTimeout(pollId);
    };
  }, [room, blockedBy]);

  // autoscroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const append = (msg: ChatMessage | ChatMessage[]) => {
    setMessages((prev) => {
      const list = Array.isArray(msg) ? msg : [msg];
      const seen = new Set(prev.map((m) => m.id));
      const merged = [...prev];
      for (const m of list) if (!seen.has(m.id)) merged.push(m);
      return merged.sort((a, b) => a.ts - b.ts);
    });
  };

  async function send() {
    if (blockedBy) return;
    const text = draft.replace(/\s+/g, " ").trim();
    if (!text) return;

    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const optimistic: ChatMessage = {
      id: clientId,
      room: room.toLowerCase(),
      username: me,
      text,
      ts: Date.now(),
    };
    append(optimistic);
    setDraft("");

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ room, username: me, text, clientId }),
      });
    } catch {
      // ignore; SSE/poll will reconcile
    } finally {
      inputRef.current?.focus();
    }
  }

  return (
    <div className="h-full border border-white/10 rounded-2xl p-3 bg-white/5 flex flex-col relative">
      <div className="text-center text-sm font-semibold tracking-wider mb-3">CHAT</div>

      {/* Block overlay if another room is active */}
      {blockedBy && (
        <div className="absolute inset-3 z-10 rounded-xl bg-black/70 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-medium mb-2">Cannot join more than one chatroom at a time.</div>
          <div className="text-xs opacity-80 mb-4">
            You are already active in <span className="font-semibold">@{blockedBy}</span>. Close that tab to chat here.
          </div>
        </div>
      )}

      {/* scroll area */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 ? (
          <div className="text-xs opacity-60 text-center mt-4">Be the first to say hello.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm leading-snug">
              <span className={`font-semibold ${m.username === me ? "text-white" : "text-white/80"}`}>
                {m.username.toUpperCase()}:
              </span>{" "}
              <span className="break-words">{m.text}</span>
            </div>
          ))
        )}
      </div>

      {/* input row */}
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 500))}
          placeholder="Type a message…"
          className="flex-1 rounded-xl bg-black/30 px-3 py-2 outline-none"
          disabled={!!blockedBy}
        />
        <button
          type="submit"
          disabled={!!blockedBy}
          className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
