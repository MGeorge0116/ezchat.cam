// lib/server/chat.ts
// Chat with optional Redis backing + in-memory subscribers for SSE.

import {
  storeChatAdd,
  storeChatHistory,
  type StoredChatMessage,
} from "@/lib/server/store";

export type ChatMessage = StoredChatMessage;

type ChatState = {
  rooms: Map<string, ChatMessage[]>; // used only when Redis is not configured
  subs: Map<string, Set<(msg: ChatMessage) => void>>;
  maxPerRoom: number;
};

const g = globalThis as any;
if (!g.__chatState) {
  g.__chatState = {
    rooms: new Map(),
    subs: new Map(),
    maxPerRoom: 200,
  } as ChatState;
}
const state: ChatState = g.__chatState;

const keyRoom = (r: string) => r.toLowerCase();

export async function addMessage(
  room: string,
  username: string,
  text: string,
  clientId?: string
): Promise<ChatMessage> {
  const rkey = keyRoom(room);
  const id = clientId || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const msg: ChatMessage = { id, room: rkey, username: username.toLowerCase(), text, ts: Date.now() };

  // Persist in Redis if available
  await storeChatAdd(rkey, msg);

  // Also keep a tiny in-memory buffer (for non-Redis setups / local dev)
  if (!state.rooms.has(rkey)) state.rooms.set(rkey, []);
  const list = state.rooms.get(rkey)!;
  list.push(msg);
  if (list.length > state.maxPerRoom) list.splice(0, list.length - state.maxPerRoom);

  // Notify SSE subscribers (works on a single long-running process, e.g., VPS)
  const subs = state.subs.get(rkey);
  if (subs) for (const cb of subs) { try { cb(msg); } catch {} }

  return msg;
}

export async function getHistory(room: string, limit = 100): Promise<ChatMessage[]> {
  const rkey = keyRoom(room);
  const fromRedis = await storeChatHistory(rkey, limit);
  if (fromRedis.length > 0) return fromRedis;
  const list = state.rooms.get(rkey) || [];
  return list.slice(Math.max(0, list.length - Math.max(1, Math.min(limit, 1000))));
}

export function subscribeChat(room: string, cb: (msg: ChatMessage) => void): () => void {
  const rkey = keyRoom(room);
  if (!state.subs.has(rkey)) state.subs.set(rkey, new Set());
  const set = state.subs.get(rkey)!;
  set.add(cb);
  return () => set.delete(cb);
}
