import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { room, author, text } = await req.json();

    if (!room || !author || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Ensure the room exists
    const dbRoom =
      (await prisma.room.findUnique({ where: { name: room } })) ??
      (await prisma.room.create({ data: { name: room } }));

    // Create message (NOTE: model is Message -> prisma.message)
    const msg = await prisma.message.create({
      data: {
        roomId: dbRoom.id,
        author,
        text,
      },
    });

    return NextResponse.json({ ok: true, message: msg });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
