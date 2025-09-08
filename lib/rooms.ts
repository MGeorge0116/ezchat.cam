import Redis from "ioredis";

export type RoomMeta = {
  username: string;
  description?: string;
  avatarDataUrl?: string;
  promoted?: boolean;
  isLive?: boolean;
  watching?: number;
  broadcasters?: number;
  lastSeen?: number;
};

function getRedis(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const needsTLS =
    url.startsWith("rediss://") ||
    url.includes("redis-cloud.com") ||
    url.includes(".redns.redis-cloud.com");
  // @ts-ignore
  return new Redis(url, needsTLS ? { tls: { rejectUnauthorized: false } } : undefined);
}

/**
 * Minimal upsert so the API route compiles.
 * Stores room metadata in Redis when available; otherwise no-ops and returns the payload.
 */
export async function upsertRoom(input: RoomMeta) {
  const username = String(input.username || "").trim().toLowerCase();
  if (!username) return { ok: false, error: "username required" };

  const r = getRedis();
  const payload: RoomMeta = {
    username,
    description: input.description ?? "",
    avatarDataUrl: input.avatarDataUrl ?? "",
    promoted: !!input.promoted,
    isLive: !!input.isLive,
    watching: Number(input.watching ?? 0),
    broadcasters: Number(input.broadcasters ?? 0),
    lastSeen: Date.now()
  };

  if (r) {
    const key = `room:meta:${username}`;
    await r.set(key, JSON.stringify(payload), "EX", 60 * 60); // 1h TTL
  }
  // If no Redis, we still return success so the route works without DB.
  return { ok: true, room: payload };
}
