export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { room, username, text } = await req.json();
    if (!room || !username || !text) {
      return NextResponse.json({ ok: false, error: "room, username, text required" }, { status: 400 });
    }

    const roomRec = await prisma.room.upsert({
      where: { name: room.toLowerCase() },
      create: { name: room.toLowerCase(), title: room.toUpperCase() },
      update: {},
    });

    await prisma.message.create({
      data: {
        roomId: roomRec.id,
        username,
        text: String(text).slice(0, 2000),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 500 });
  }
}
