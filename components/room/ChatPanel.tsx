"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = { id: string; room: string; username: string; text: string; ts: number };
const ACTIVE_KEY = "chat:active";
const ACTIVE_TTL_MS = 15000;

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

export default function ChatPanel({ room }: { room: string }) {
  const me = useMemo(currentUsername, []);
  const tabId = useMemo(myTabId, []);
  const [blockedBy, setBlockedBy] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const joinTsRef = useRef<number>(Date.now());
  const ownsLockRef = useRef(false);
  const heartbeatIdRef = useRef<any>(null);

  useEffect(() => {
    function readLock() {
      try { const raw = localStorage.getItem(ACTIVE_KEY); return raw ? JSON.parse(raw) : null; }
      catch { return null; }
    }
    function writeLock(v: any) { try { localStorage.setItem(ACTIVE_KEY, JSON.stringify(v)); } catch {} }
    function tryAcquire() {
      const cur = readLock();
      const now = Date.now();
      if (!cur || now - cur.ts > ACTIVE_TTL_MS) {
        ownsLockRef.current = true; setBlockedBy(null);
        writeLock({ room: room.toLowerCase(), tabId, ts: now });
        heartbeatIdRef.current = setInterval(() => {
          const c2 = readLock();
          if (c2 && c2.tabId === tabId) writeLock({ ...c2, ts: Date.now(), room: room.toLowerCase() });
        }, 4000);
        return;
      }
      if (cur.room !== room.toLowerCase() || cur.tabId !== tabId) {
        ownsLockRef.current = false; setBlockedBy(cur.room); return;
      }
      ownsLockRef.current = true; setBlockedBy(null);
      writeLock({ ...cur, ts: now, room: room.toLowerCase(), tabId });
      heartbeatIdRef.current = setInterval(() => {
        const c2 = readLock();
        if (c2 && c2.tabId === tabId) writeLock({ ...c2, ts: Date.now(), room: room.toLowerCase() });
      }, 4000);
    }
    tryAcquire();
    function onStorage(e: StorageEvent) {
      if (e.key !== ACTIVE_KEY) return;
      const cur = (() => { try { return e.newValue ? JSON.parse(e.newValue) : null; } catch { return null; }})();
      const now = Date.now();
      if (!cur || now - cur.ts > ACTIVE_TTL_MS) {
        if (!ownsLockRef.current) tryAcquire(); return;
      }
      if (cur.tabId !== tabId || cur.room !== room.toLowerCase()) {
        ownsLockRef.current = false; setBlockedBy(cur.room);
      } else {
        ownsLockRef.current = true; setBlockedBy(null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (heartbeatIdRef.current) clearInterval(heartbeatIdRef.current);
      try {
        const raw = localStorage.getItem(ACTIVE_KEY);
        const cur = raw ? JSON.parse(raw) : null;
        if (cur && cur.tabId === tabId) localStorage.removeItem(ACTIVE_KEY);
      } catch {}
    };
  }, [room, tabId]);

  useEffect(() => {
    if (blockedBy) return;
    joinTsRef.current = Date.now();
    setMessages([]);
    let closed = false;
    let pollId: any = null;

    async function tick() {
      try {
        const res = await fetch(`/api/chat/history?room=${encodeURIComponent(room)}&limit=120`, { cache: "no-store" });
        const data = await res.json();
        const since = joinTsRef.current;
        const arr = (data?.messages || []).filter((m: ChatMessage) => (m?.ts || 0) > since);
        if (!closed && arr.length) append(arr);
      } catch {}
      finally { if (!closed) pollId = setTimeout(tick, document.hidden ? 8000 : 3000); }
    }
    tick();
    return () => { closed = true; if (pollId) clearTimeout(pollId); };
  }, [room, blockedBy]);

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
    const optimistic: ChatMessage = { id: clientId, room: room.toLowerCase(), username: me, text, ts: Date.now() };
    append(optimistic);
    setDraft("");

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ room, username: me, text, clientId }),
      });
    } catch {}
    finally { inputRef.current?.focus(); }
  }

  return (
    <div className="h-full border border-white/10 rounded-2xl p-3 bg-white/5 flex flex-col relative">
      <div className="text-center text-sm font-semibold tracking-wider mb-3">CHAT</div>

      {blockedBy && (
        <div className="absolute inset-3 z-10 rounded-xl bg-black/70 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-medium mb-2">Cannot join more than one chatroom at a time.</div>
          <div className="text-xs opacity-80 mb-4">You are already active in <span className="font-semibold">@{blockedBy}</span>.</div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 ? (
          <div className="text-xs opacity-60 text-center mt-4">Be the first to say hello.</div>
        ) : messages.map((m) => (
          <div key={m.id} className="text-sm leading-snug">
            <span className={`font-semibold ${m.username === me ? "text-white" : "text-white/80"}`}>{m.username.toUpperCase()}:</span>{" "}
            <span className="break-words">{m.text}</span>
          </div>
        ))}
      </div>

      <form className="mt-3 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 500))}
          placeholder="Type a message…"
          className="flex-1 rounded-xl bg-black/30 px-3 py-2 outline-none"
          disabled={!!blockedBy}
        />
        <button type="submit" disabled={!!blockedBy} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
