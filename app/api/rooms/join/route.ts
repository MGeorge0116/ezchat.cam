export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { room, ownerUsername } = await req.json();
  if (!room) return NextResponse.json({ ok: false, error: "room required" }, { status: 400 });

  await prisma.room.upsert({
    where: { name: room.toLowerCase() },
    create: { name: room.toLowerCase(), title: room.toUpperCase(), ownerUsername: ownerUsername?.toLowerCase() || null, lastSeenAt: new Date() },
    update: { lastSeenAt: new Date(), ownerUsername: ownerUsername?.toLowerCase() || null },
  });

  return NextResponse.json({ ok: true });
}
