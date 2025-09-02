import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");

    if (!room) {
      return NextResponse.json({ error: "Missing room" }, { status: 400 });
    }

    const roomRow = await prisma.room.findUnique({
      where: { name: room },
      select: { id: true },
    });

    if (!roomRow) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: roomRow.id },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
