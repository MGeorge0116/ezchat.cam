// lib/rooms.ts
// Simple in-memory room directory with TTL + counts. Resets on server restart.

export type RoomInfo = {
  room: string;
  title: string;
  lastSeen: number;      // epoch ms
  usersCount?: number;   // total connected users
  camsCount?: number;    // users that currently have video
};

const rooms = new Map<string, RoomInfo>();
const TTL_MS = 1000 * 60 * 5; // Remove rooms idle > 5 minutes

function purge() {
  const now = Date.now();
  for (const [key, val] of rooms) {
    if (now - val.lastSeen > TTL_MS) rooms.delete(key);
  }
}

export function upsertRoom(
  room: string,
  title?: string,
  usersCount?: number,
  camsCount?: number
) {
  const r = room.trim();
  if (!r) return;
  purge();
  const existing = rooms.get(r);
  rooms.set(r, {
    room: r,
    title: (title ?? existing?.title ?? r).trim(),
    lastSeen: Date.now(),
    usersCount: typeof usersCount === "number" ? usersCount : existing?.usersCount,
    camsCount: typeof camsCount === "number" ? camsCount : existing?.camsCount,
  });
}

export function listRooms(): RoomInfo[] {
  purge();
  // Return shuffled copy (random order for display)
  const arr = Array.from(rooms.values());
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Sort tie-breaker by lastSeen descending so newest still tends to surface
  return arr.sort((a, b) => b.lastSeen - a.lastSeen);
}
