import { NextRequest, NextResponse } from "next/server";
import { requireStrings } from "@/lib/guards";
import type { HeartbeatBody } from "@/lib/types";
import { heartbeat } from "@/lib/server/presence";

export async function POST(req: NextRequest) {
  const bodyUnknown: unknown = await req.json();
  if (!requireStrings(bodyUnknown, ["room", "username"])) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const body = bodyUnknown as HeartbeatBody;

  const res = await heartbeat(body.room, body.username);
  return NextResponse.json(res ?? { ok: true });
}
