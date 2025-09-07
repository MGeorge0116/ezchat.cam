// app/api/chat/history/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getHistory } from "@/lib/server/chat";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const room = String(url.searchParams.get("room") || "").toLowerCase();
  const limit = Number(url.searchParams.get("limit") || 100);
  if (!room) return NextResponse.json({ messages: [] });
  const messages = getHistory(room, Math.max(1, Math.min(limit, 200)));
  return NextResponse.json({ messages });
}
