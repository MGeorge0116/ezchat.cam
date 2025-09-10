// app/api/chat/history/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const room = url.searchParams.get("room");
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(200, Number(limitParam))) : 50;

  if (!room) return NextResponse.json({ error: "Missing room" }, { status: 400 });

  const { getHistory } = await import("@/lib/server/chat"); // lazy import
  const messages = await getHistory(room, limit);
  return NextResponse.json({ messages });
}
