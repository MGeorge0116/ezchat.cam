import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const STALE_MS = 2 * 60 * 1000; // 2 minutes

export async function POST(req: Request) {
  try {
    const { room, user } = await req.json() as { room?: string; user?: string };
    if (!room || !user) {
      return NextResponse.json({ error: "room and user are required" }, { status: 400 });
    }

    const now = new Date();

    // find or create the room
    const existing = await prisma.room.upsert({
      where: { name: room },
      update: {},
      create: { name: room },
    });

    const isStale =
      existing.occupiedAt &&
      now.getTime() - new Date(existing.occupiedAt).getTime() > STALE_MS;

    // Allowed if:
    // - nobody is in it, or
    // - it's stale, or
    // - the same user is rejoining (refresh, second tab)
    if (!existing.occupiedBy || isStale || existing.occupiedBy === user) {
      const updated = await prisma.room.update({
        where: { name: room },
        data: { occupiedBy: user, occupiedAt: now },
      });
      return NextResponse.json({ ok: true, room: updated.name });
    }

    // someone else holds it and not stale -> reject
    return NextResponse.json(
      { ok: false, reason: "occupied" },
      { status: 423 } // Locked
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
