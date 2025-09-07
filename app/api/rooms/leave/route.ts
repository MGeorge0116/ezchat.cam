export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { room, username } = await req.json();
  if (!room || !username) return NextResponse.json({ ok: false, error: "room and username required" }, { status: 400 });

  // Remove presence; touch room lastSeenAt
  await prisma.presence.deleteMany({
    where: { room: room.toLowerCase(), username: username.toLowerCase() },
  });

  await prisma.room.updateMany({
    where: { name: room.toLowerCase() },
    data: { lastSeenAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
