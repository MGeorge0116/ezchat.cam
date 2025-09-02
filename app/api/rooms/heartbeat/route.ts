import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { room, user, rtcUid } = await req.json() as {
      room?: string; user?: string; rtcUid?: string | number;
    };
    if (!room || !user) {
      return NextResponse.json({ error: "room and user are required" }, { status: 400 });
    }

    // keep the single-occupancy lock fresh (if they still own it)
    const r = await prisma.room.findUnique({ where: { name: room } });
    if (!r || r.occupiedBy !== user) {
      return NextResponse.json({ ok: false }, { status: 409 });
    }
    await prisma.room.update({
      where: { name: room },
      data: { occupiedAt: new Date() },
    });

    // also upsert presence entry + rtcUid mapping
    await prisma.presence.upsert({
      where: { room_username: { room, username: user } },
      update: { rtcUid: rtcUid?.toString() },
      create: { room, username: user, rtcUid: rtcUid?.toString() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
