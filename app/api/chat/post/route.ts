export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

/**
 * POST /api/chat/post
 * Body: { room: string; text: string }
 * Auth: optional — if logged in, we store userId + username; otherwise username="guest"
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      room?: string;
      text?: string;
    };

    const room = String(body?.room ?? "").trim();
    const text = String(body?.text ?? "").trim();

    if (!room) {
      return NextResponse.json({ error: "missing_room" }, { status: 400 });
    }
    if (!text) {
      return NextResponse.json({ error: "empty_text" }, { status: 400 });
    }
    if (text.length > 1000) {
      return NextResponse.json({ error: "text_too_long" }, { status: 400 });
    }

    // Resolve room id from slug/name
    const dbRoom = await prisma.room.findUnique({
      where: { name: room.toLowerCase() },
      select: { id: true },
    });
    if (!dbRoom) {
      return NextResponse.json({ error: "room_not_found" }, { status: 404 });
    }

    // Optional auth via our cookie
    const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
    const payload = verifyToken(token);
    let userId: string | null = null;
    let username = "guest";

    if (payload?.uid) {
      // Look up the user for a stable username
      const user = await prisma.user.findUnique({
        where: { id: String(payload.uid) },
        select: { id: true, username: true },
      });
      if (user) {
        userId = user.id;
        username = user.username;
      }
    }

    const message = await prisma.message.create({
      data: {
        roomId: dbRoom.id,
        userId,            // can be null
        username,          // required by schema
        text,
      },
      select: {
        id: true,
        roomId: true,
        userId: true,
        username: true,
        text: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "failed" },
      { status: 400 }
    );
  }
}
