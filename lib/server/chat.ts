// lib/server/chat.ts
import "server-only";

import type IORedis from "ioredis";

// ---- Lazy Redis (prevents bundling into Edge/client) ----
let redis: IORedis | null = null;
async function getRedis() {
  if (!redis) {
    const { default: Redis } = await import("ioredis");
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is not set");
    redis = new Redis(url);
  }
  return redis;
}

// ---- Types ----
export type ChatMessage = {
  id: string;
  room: string;
  username: string;
  text: string;
  ts: number; // epoch ms
};

// ---- Keys / channels ----
const chan = (room: string) => `room:${room}`;
const historyKey = (room: string) => `history:${room}`;
const HISTORY_LIMIT = 200;

// ---- Public API ----

/** Publish + persist a message to a room */
export async function appendMessage(room: string, username: string, text: string): Promise<ChatMessage> {
  const r = await getRedis();

  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    room,
    username,
    text,
    ts: Date.now(),
  };

  // Persist (LPUSH newest-first) and trim
  await r.lpush(historyKey(room), JSON.stringify(message));
  await r.ltrim(historyKey(room), 0, HISTORY_LIMIT - 1);

  // Fan out
  await r.publish(chan(room), JSON.stringify(message));

  return message;
}

/** Load recent history (oldest → newest) */
export async function getHistory(room: string, limit = 50): Promise<ChatMessage[]> {
  const r = await getRedis();
  // We stored newest-first; LRANGE 0..limit-1 then reverse to oldest-first for UI
  const raw = await r.lrange(historyKey(room), 0, Math.max(0, limit - 1));
  const parsed = raw.map((s) => {
    try { return JSON.parse(s) as ChatMessage; } catch { return null; }
  }).filter((x): x is ChatMessage => !!x);
  return parsed.reverse();
}

/** Subscribe to live messages for SSE */
export function subscribeChat(room: string, onMessage: (data: unknown) => void) {
  let cleanup: null | (() => void | Promise<void>) = null;

  (async () => {
    const base = await getRedis();
    const sub = base.duplicate();
    await sub.subscribe(chan(room));

    const handler = (_channel: string, msg: string) => {
      try { onMessage(JSON.parse(msg)); } catch { /* ignore */ }
    };
    sub.on("message", handler);

    cleanup = async () => {
      sub.off("message", handler);
      try { await sub.unsubscribe(chan(room)); }
      finally { sub.quit(); }
    };
  })().catch(() => { /* swallow to avoid crashing caller */ });

  // Return unsubscribe
  return () => { if (cleanup) void cleanup(); };
}
