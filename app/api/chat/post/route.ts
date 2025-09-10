// app/api/chat/post/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

type Body = { room?: string; username?: string; text?: string };

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body;
  if (!body?.room || !body?.username || !body?.text) {
    return NextResponse.json({ error: "room, username, and text are required" }, { status: 400 });
  }

  const { appendMessage } = await import("@/lib/server/chat"); // lazy import
  const msg = await appendMessage(body.room, body.username, body.text);
  // 202 Accepted so the client doesn’t wait on subscribers
  return NextResponse.json({ ok: true, message: msg }, { status: 202 });
}
