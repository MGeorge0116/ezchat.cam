// lib/rooms.ts
// Minimal in-memory implementation to satisfy API routes in serverless.
// Replace with Redis/DB later if you want persistence across cold starts.

export type RoomSummary = {
  name: string;         // unique room slug
  username: string;     // room owner / route param
  description?: string; // up to 100 chars
  avatarUrl?: string;   // owner avatar for directory card
  viewers: number;      // total users in room
  broadcasters: number; // users currently broadcasting (<= 12)
  promoted?: boolean;   // whether shown as promoted
};

export type UpsertInput = {
  name: string;
  username: string;
  description?: string;
  avatarUrl?: string;
  promoted?: boolean;
};

// Persist the Map across hot reloads (dev) and warm lambdas (prod).
declare global {
  // eslint-disable-next-line no-var
  var __roomsStore: Map<string, RoomSummary> | undefined;
}

const store: Map<string, RoomSummary> =
  globalThis.__roomsStore ?? new Map<string, RoomSummary>();

// Attach back to global in non-production to survive HMR during `next dev`.
if (process.env.NODE_ENV !== "production") {
  globalThis.__roomsStore = store;
}

function keyOf(name: string) {
  return name.trim().toLowerCase();
}

/** Create or update a room summary. */
export async function upsertRoom(input: UpsertInput): Promise<RoomSummary> {
  const key = keyOf(input.name);
  const prev = store.get(key);

  const next: RoomSummary = {
    name: key,
    username: input.username,
    description: (input.description ?? prev?.description ?? "").slice(0, 100),
    avatarUrl: input.avatarUrl ?? prev?.avatarUrl,
    promoted: input.promoted ?? prev?.promoted ?? false,
    // If you have live presence elsewhere, you can overwrite these on read:
    viewers: prev?.viewers ?? 0,
    broadcasters: prev?.broadcasters ?? 0,
  };

  store.set(key, next);
  return next;
}

/** Get a single room by name (or null if missing). */
export async function getRoom(name: string): Promise<RoomSummary | null> {
  return store.get(keyOf(name)) ?? null;
}

/** List all rooms (you can sort/filter here if desired). */
export async function listRooms(): Promise<RoomSummary[]> {
  return Array.from(store.values());
}

/** Optional helper to update live counters without altering other fields. */
export async function setCounts(
  name: string,
  counts: { viewers?: number; broadcasters?: number }
): Promise<RoomSummary | null> {
  const key = keyOf(name);
  const prev = store.get(key);
  if (!prev) return null;

  const next: RoomSummary = {
    ...prev,
    viewers: counts.viewers ?? prev.viewers,
    broadcasters: counts.broadcasters ?? prev.broadcasters,
  };

  store.set(key, next);
  return next;
}
