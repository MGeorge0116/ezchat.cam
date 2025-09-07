// lib/server/chat.ts
// In-memory chat store + pub/sub. Survives dev hot reload via global.

export type ChatMessage = {
  id: string;
  room: string;
  username: string;
  text: string;
  ts: number; // epoch ms
};

type ChatState = {
  rooms: Map<string, ChatMessage[]>;
  subs: Map<string, Set<(msg: ChatMessage) => void>>;
  maxPerRoom: number;
};

// Persist across hot-reloads in dev
const g = globalThis as any;
if (!g.__chatState) {
  g.__chatState = {
    rooms: new Map(),
    subs: new Map(),
    maxPerRoom: 200,
  } as ChatState;
}
const state: ChatState = g.__chatState;

function roomKey(r: string) {
  return r.toLowerCase();
}

function findById(list: ChatMessage[], id: string) {
  return list.find((m) => m.id === id);
}

/**
 * Add a message and notify subscribers.
 * If `clientId` is provided and a message with the same id already exists,
 * the existing message is returned and no duplicate is pushed.
 */
export function addMessage(
  room: string,
  username: string,
  text: string,
  clientId?: string
): ChatMessage {
  const key = roomKey(room);
  if (!state.rooms.has(key)) state.rooms.set(key, []);
  const list = state.rooms.get(key)!;

  // If client provided an id, avoid duplicates
  if (clientId) {
    const existing = findById(list, clientId);
    if (existing) return existing;
  }

  const id = clientId || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const msg: ChatMessage = {
    id,
    room: key,
    username: username.toLowerCase(),
    text,
    ts: Date.now(),
  };

  list.push(msg);
  if (list.length > state.maxPerRoom) list.splice(0, list.length - state.maxPerRoom);

  const subs = state.subs.get(key);
  if (subs) {
    for (const cb of subs) {
      try {
        cb(msg);
      } catch {
        /* ignore subscriber errors */
      }
    }
  }

  return msg;
}

export function getHistory(room: string, limit = 100): ChatMessage[] {
  const key = roomKey(room);
  const list = state.rooms.get(key) || [];
  return list.slice(Math.max(0, list.length - Math.max(1, Math.min(limit, 1000))));
}

export function subscribeChat(room: string, cb: (msg: ChatMessage) => void): () => void {
  const key = roomKey(room);
  if (!state.subs.has(key)) state.subs.set(key, new Set());
  const set = state.subs.get(key)!;
  set.add(cb);
  return () => set.delete(cb);
}
