import type { PresenceEvent, RoomName, Username } from "@/lib/types";

const listeners = new Map<RoomName, Set<(data: unknown) => void>>();
const lastSeen = new Map<RoomName, Map<Username, number>>();

export function subscribePresence(room: RoomName, send: (data: unknown) => void) {
  let set = listeners.get(room);
  if (!set) {
    set = new Set();
    listeners.set(room, set);
  }
  set.add(send);
  return () => {
    set?.delete(send);
    if (set && set.size === 0) listeners.delete(room);
  };
}

export async function heartbeat(room: RoomName, username: Username) {
  let map = lastSeen.get(room);
  if (!map) {
    map = new Map();
    lastSeen.set(room, map);
  }
  map.set(username, Date.now());
  const ev: PresenceEvent = { type: "heartbeat", room, username, at: Date.now() };
  listeners.get(room)?.forEach((cb) => cb(ev));
  return { ok: true };
}
