// lib/rooms.ts
// Minimal in-memory implementation to satisfy API routes in serverless.
// Replace with Redis/DB later if you want persistence across lambdas.

export type RoomSummary = {
  name: string;           // unique room slug
  username: string;       // room owner / route param
  description?: string;   // up to 100 chars
  avatarUrl?: string;     // owner avatar for directory card
  viewers: number;        // total users in room
  broadcasters: number;   // users currently broadcasting (<= 12)
  promoted?: boolean;     // whether shown as promoted
};

type UpsertInput = {
  name: string;
  username: string;
  description?: string;
  avatarUrl?: string;
  promoted?: boolean;
};

const __memory = {
  rooms: new Map<string, RoomSummary>(),
};

/** Create or update a room summary. */
export async function upsertRoom(input: UpsertInput): Promise<RoomSummary> {
  const key = input.name.trim().toLowerCase();
  const prev = __memory.rooms.get(key);
  const next: RoomSummary = {
    name: key,
    username: input.username,
    description:
      (input.description ?? prev?.description ?? "").slice(0, 100),
    avatarUrl: input.avatarUrl ?? prev?.avatarUrl,
    promoted: input.promoted ?? prev?.promoted ?? false,
    // If you have live presence elsewhere, you can overwrite these on read:
    viewers: prev?.viewers ?? 0,
    broadcasters: prev?.broadcasters ?? 0,
  };
  __memory.rooms.set(key, next);
  return next;
}

/** List all rooms (you can sort/filter here if desired). */
export async function listRooms(): Promise<RoomSummary[]> {
  return Array.from(__memory.rooms.values());
}

/** Optional helpers to update live counters without altering other fields. */
export async function setCounts(
  name: string,
  counts: { viewers?: number; broadcasters?: number }
) {
  const key = name.trim().toLowerCase();
  const prev = __memory.rooms.get(key);
  if (!prev) return;
  __memory.rooms.set(key, {
    ...prev,
    viewers: counts.viewers ?? prev.viewers,
    broadcasters: counts.broadcasters ?? prev.broadcasters,
  });
}
