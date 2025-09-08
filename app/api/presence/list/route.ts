export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { list } from "@/lib/server/presence";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const room = String(url.searchParams.get("room") || "").toLowerCase();
  if (!room) return NextResponse.json({ users: [] });

  const users = (await list(room)).map((u) => ({
    username: u.username,
    lastSeen: new Date(u.lastSeen).toISOString(),
    isLive: !!u.isLive,
  }));
  return NextResponse.json({ users });
}
