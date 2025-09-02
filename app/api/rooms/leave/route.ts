import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { room, user } = await req.json() as { room?: string; user?: string };
    if (!room || !user) {
      return NextResponse.json({ error: "room and user are required" }, { status: 400 });
    }

    const r = await prisma.room.findUnique({ where: { name: room } });
    if (!r) return NextResponse.json({ ok: true }); // nothing to do

    // Only the owner can release
    if (r.occupiedBy === user) {
      await prisma.room.update({
        where: { name: room },
        data: { occupiedBy: null, occupiedAt: null },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
