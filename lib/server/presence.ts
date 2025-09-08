import {
  storePresenceTouch,
  storePresenceList,
  type StoredPresence,
} from "@/lib/server/store";

export type PresenceUser = StoredPresence;

type RoomMap = Map<string, PresenceUser>;
type Sub = (users: PresenceUser[]) => void;

type PresenceState = { rooms: Map<string, RoomMap>; subs: Map<string, Set<Sub>> };

const g = (globalThis as any);
if (!g.__presenceState) {
  g.__presenceState = { rooms: new Map(), subs: new Map() } as PresenceState;
}
const state: PresenceState = g.__presenceState;

const keyRoom = (r: string) => r.toLowerCase();

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
  const cutoff = Date.now() - 30_000;
  for (const [u, e] of m) if ((e.lastSeen || 0) < cutoff) m.delete(u);
}

export async function touch(room: string, username: string, isLive?: boolean) {
  await storePresenceTouch(room, username, isLive);
  const m = roomMap(room);
  const u = username.toLowerCase();
  m.set(u, { username: u, lastSeen: Date.now(), isLive: !!isLive });
  notify(room);
}

export async function list(room: string): Promise<PresenceUser[]> {
  const fromRedis = await storePresenceList(room);
  if (fromRedis.length > 0) return fromRedis;
  prune(room);
  const m = roomMap(room);
  return Array.from(m.values()).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
}

export function subscribe(room: string, cb: Sub): () => void {
  const set = roomSubs(room);
  set.add(cb);
  list(room).then((users) => { try { cb(users); } catch {} });
  return () => set.delete(cb);
}

export async function notify(room: string) {
  const users = await list(room);
  for (const cb of roomSubs(room)) { try { cb(users); } catch {} }
}
