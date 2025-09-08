// Unified storage adapter: Redis (via REDIS_URL) or in-memory fallback.
import Redis from "ioredis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (redis) return redis;

  const needsTLS =
    url.startsWith("rediss://") ||
    url.includes("redis-cloud.com") ||
    url.includes(".redns.redis-cloud.com");

  redis = new Redis(url, needsTLS ? { tls: { rejectUnauthorized: false } } : undefined);
  return redis;
}

/* Chat */
export type StoredChatMessage = { id: string; room: string; username: string; text: string; ts: number };
const CHAT_MAX = 200;
const chatKey = (room: string) => `chat:${room.toLowerCase()}`;

export async function storeChatAdd(room: string, msg: StoredChatMessage) {
  const r = getRedis(); if (!r) return;
  const key = chatKey(room);
  await r.lpush(key, JSON.stringify(msg));
  await r.ltrim(key, 0, CHAT_MAX - 1);
}

export async function storeChatHistory(room: string, limit = 100): Promise<StoredChatMessage[]> {
  const r = getRedis(); if (!r) return [];
  const key = chatKey(room);
  const raw = await r.lrange(key, 0, Math.max(0, Math.min(limit, CHAT_MAX)) - 1);
  const arr = raw.map((s) => safeJson<StoredChatMessage>(s)).filter(Boolean) as StoredChatMessage[];
  arr.sort((a, b) => a.ts - b.ts);
  return arr;
}

/* Presence */
export type StoredPresence = { username: string; lastSeen: number; isLive?: boolean };
const presenceIdx = (room: string) => `presence:${room.toLowerCase()}:index`;
const presenceUser = (room: string, u: string) => `presence:${room.toLowerCase()}:${u.toLowerCase()}`;
const PRESENCE_TTL = 30; // seconds

export async function storePresenceTouch(room: string, username: string, isLive?: boolean) {
  const r = getRedis(); if (!r) return;
  const idx = presenceIdx(room);
  const key = presenceUser(room, username);
  const payload: StoredPresence = { username: username.toLowerCase(), lastSeen: Date.now(), isLive: !!isLive };
  await r.sadd(idx, username.toLowerCase());
  await r.set(key, JSON.stringify(payload), "EX", PRESENCE_TTL);
}

export async function storePresenceList(room: string): Promise<StoredPresence[]> {
  const r = getRedis(); if (!r) return [];
  const idx = presenceIdx(room);
  const members = await r.smembers(idx);
  if (members.length === 0) return [];
  const keys = members.map((u) => presenceUser(room, u));
  const vals = await r.mget(...keys);
  const out: StoredPresence[] = [];
  for (const v of vals) {
    if (!v) continue;
    const item = safeJson<StoredPresence>(v);
    if (item && item.username) out.push(item);
  }
  out.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  return out;
}

function safeJson<T>(s: string): T | null {
  try { return JSON.parse(s) as T; } catch { return null; }
}
