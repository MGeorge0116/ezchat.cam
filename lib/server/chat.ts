// lib/server/chat.ts
import type IORedis from 'ioredis';

let redis: IORedis | null = null;

async function getRedis() {
  if (!redis) {
    const { default: Redis } = await import('ioredis'); // ⬅️ lazy import
    redis = new Redis(process.env.REDIS_URL!);
  }
  return redis;
}

export function subscribeChat(
  room: string,
  onMessage: (data: unknown) => void
) {
  // use a separate sub connection
  let cleanup: (() => Promise<void> | void) | null = null;

  (async () => {
    const base = await getRedis();
    const sub = base.duplicate();
    await sub.subscribe(`room:${room}`);

    const handler = (_ch: string, msg: string) => {
      try { onMessage(JSON.parse(msg)); } catch { /* ignore bad JSON */ }
    };
    sub.on('message', handler);

    cleanup = async () => {
      sub.off('message', handler);
      try { await sub.unsubscribe(`room:${room}`); } finally { sub.quit(); }
    };
  })().catch(() => { /* swallow init errors here; surface in caller if needed */ });

  return () => { if (cleanup) cleanup(); };
}
