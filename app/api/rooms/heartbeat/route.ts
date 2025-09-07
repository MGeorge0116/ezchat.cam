// app/api/rooms/heartbeat/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { touch } from "@/lib/server/presence";

export async function POST(req: Request) {
  try {
    const { room, username, isLive } = await req.json();
    if (!room || !username) {
      return NextResponse.json({ ok: false, error: "room and username required" }, { status: 400 });
    }
    touch(String(room), String(username), Boolean(isLive));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "heartbeat failed" }, { status: 500 });
  }
}
