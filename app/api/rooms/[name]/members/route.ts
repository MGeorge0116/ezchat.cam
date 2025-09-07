// app/api/rooms/[name]/members/route.ts
import { NextResponse } from "next/server";

type PresenceEntry = { userId: string; username: string; ts: number };
type PresenceStore = Map<string, Map<string, PresenceEntry>>;
declare global {
  // eslint-disable-next-line no-var
  var __presence: PresenceStore | undefined;
}
const P: PresenceStore = (globalThis.__presence ??= new Map());

// 👇 ctx.params is a Promise in Next 15 — await it before reading `name`.
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params; // <-- await first
  const room = String(name ?? "").toLowerCase();
  if (!room) return NextResponse.json({ users: [] });

  const cutoff = Date.now() - 35_000; // active within 35s
  const roomMap = P.get(room) ?? new Map<string, PresenceEntry>();

  const users = Array.from(roomMap.values())
    .filter((e) => e.ts >= cutoff)
    .sort((a, b) => a.username.localeCompare(b.username))
    .map((e) => ({ id: e.userId, username: e.username }));

  return NextResponse.json({ users });
}
