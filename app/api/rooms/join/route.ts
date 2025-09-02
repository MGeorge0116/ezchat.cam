export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

const STALE_MS = 2 * 60 * 1000; // consider a room stale if inactive for 2 minutes

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      room?: string;
      title?: string;
    };

    const name = (body.room || "").toLowerCase().trim();
    if (!name) {
      return NextResponse.json({ error: "missing_room" }, { status: 400 });
    }

    // Optional auth (to attach owner if "my room")
    const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
    const payload = verifyToken(token);
    let userId: string | null = null;
    let username: string | null = null;

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

    // Find existing room
    const existing = await prisma.room.findUnique({
      where: { name },
      select: {
        id: true,
        name: true,
        title: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        lastSeenAt: true,
      },
    });

    const now = new Date();

    if (!existing) {
      // Create a new room. If the room name matches the logged-in username, set them as owner.
      const isOwnersPersonalRoom =
        username && username.toLowerCase() === name ? true : false;

      const created = await prisma.room.create({
        data: {
          name,
          title: body.title ?? null,
          ownerId: isOwnersPersonalRoom && userId ? userId : null,
          lastSeenAt: now,
        },
        select: { id: true, name: true, ownerId: true, title: true, lastSeenAt: true },
      });

      return NextResponse.json({
        ok: true,
        created: true,
        room: created,
      });
    }

    // Room exists — update activity timestamp
    const isStale =
      !existing.lastSeenAt ||
      now.getTime() - new Date(existing.lastSeenAt).getTime() > STALE_MS;

    const updated = await prisma.room.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: now,
        // If there is no owner yet and this is the user's personal room, attach ownership.
        ...(existing.ownerId
          ? {}
          : username && username.toLowerCase() === name && userId
          ? { ownerId: userId }
          : {}),
      },
      select: { id: true, name: true, ownerId: true, title: true, lastSeenAt: true },
    });

    return NextResponse.json({
      ok: true,
      created: false,
      isStale,
      room: updated,
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "failed" },
      { status: 400 }
    );
  }
}
