export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { room?: string };
    const room = (body.room || "").toLowerCase().trim();
    if (!room) {
      return NextResponse.json({ error: "missing_room" }, { status: 400 });
    }

    // Identify current user (optional)
    const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
    const payload = verifyToken(token);

    let username = "guest";
    let userId: string | null = null;

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

    // 1) Clear presence (ignore if not found)
    try {
      await prisma.presence.delete({
        where: { room_username: { room, username } }, // @@unique([room, username])
      });
    } catch {
      // ignore P2025 (not found)
    }

    // 2) Touch room activity timestamp if it exists
    try {
      await prisma.room.update({
        where: { name: room },
        data: { lastSeenAt: new Date() },
      });
    } catch {
      // room may not exist yet, ignore
    }

    return NextResponse.json({ ok: true, room, userId, username });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "failed" },
      { status: 400 }
    );
  }
}
