// lib/server/presence.ts
// In-memory presence with broadcaster flag + SSE helpers (persists across dev reloads)

export type PresenceUser = { username: string; lastSeen: number; isLive?: boolean };

type RoomMap = Map<string, PresenceUser>; // username -> entry
type Sub = (users: PresenceUser[]) => void;

type PresenceState = {
  rooms: Map<string, RoomMap>;
  subs: Map<string, Set<Sub>>;
};

const g = globalThis as any;
if (!g.__presenceState) {
  g.__presenceState = { rooms: new Map(), subs: new Map() } as PresenceState;
}
const state: PresenceState = g.__presenceState;

const keyRoom = (r: string) => r.toLowerCase();
const now = () => Date.now();

function roomMap(room: string): RoomMap {
  const k = keyRoom(room);
  if (!state.rooms.has(k)) state.rooms.set(k, new Map());
  return state.rooms.get(k)!;
}
function roomSubs(room: string): Set<Sub> {
  const k = keyRoom(room);
  if (!state.subs.has(k)) state.subs.set(k, new Set());
  return state.subs.get(k)!;
}
function prune(room: string) {
  const m = roomMap(room);
  const cutoff = now() - 30_000; // 30s active window
  for (const [u, entry] of m) {
    if (entry.lastSeen < cutoff) m.delete(u);
  }
}

export function touch(room: string, username: string, isLive?: boolean) {
  const m = roomMap(room);
  const uname = username.toLowerCase();
  const entry = m.get(uname) || { username: uname, lastSeen: now(), isLive: !!isLive };
  entry.lastSeen = now();
  if (typeof isLive === "boolean") entry.isLive = isLive;
  m.set(uname, entry);
  notify(room);
}

export function list(room: string): PresenceUser[] {
  prune(room);
  return Array.from(roomMap(room).values()).sort((a, b) => b.lastSeen - a.lastSeen);
}

export function subscribe(room: string, cb: Sub): () => void {
  const set = roomSubs(room);
  set.add(cb);
  try { cb(list(room)); } catch {}
  return () => set.delete(cb);
}

export function notify(room: string) {
  const users = list(room);
  for (const cb of roomSubs(room)) {
    try { cb(users); } catch {}
  }
}
