// app/api/chat/send/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { addMessage } from "@/lib/server/chat";

export async function POST(req: Request) {
  try {
    const { room, username, text, clientId } = await req.json();

    const r = String(room || "").trim().toLowerCase();
    const u = String(username || "").trim().toLowerCase();
    const t = String(text || "").replace(/\s+/g, " ").trim();
    const cid = clientId ? String(clientId) : undefined;

    if (!r || !u || !t) {
      return NextResponse.json({ ok: false, error: "room, username, text required" }, { status: 400 });
    }
    if (t.length > 500) {
      return NextResponse.json({ ok: false, error: "message too long" }, { status: 400 });
    }

    const msg = addMessage(r, u, t, cid); // echo clientId to dedupe
    return NextResponse.json({ ok: true, message: msg });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "send failed" }, { status: 500 });
  }
}
