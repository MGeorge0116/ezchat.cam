export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { room: rawRoom } = (await req.json().catch(() => ({}))) as { room?: string };
  const room = (rawRoom || "").toLowerCase().trim();
  if (!room) return NextResponse.json({ error: "missing_room" }, { status: 400 });

  // get logged-in user (optional)
  const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const payload = verifyToken(token);

  let userId: string | null = null;
  let username = "guest";

  if (payload?.uid) {
    const u = await prisma.user.findUnique({
      where: { id: String(payload.uid) },
      select: { id: true, username: true },
    });
    if (u) {
      userId = u.id;
      username = u.username;
    }
  }

  await prisma.presence.upsert({
    where: { room_username: { room, username } }, // from @@unique([room, username])
    update: { lastSeen: new Date(), userId },
    create: { room, username, userId, lastSeen: new Date() },
  });

  return NextResponse.json({ ok: true });
}
