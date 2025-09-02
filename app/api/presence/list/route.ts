import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const STALE_MS = 2 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  if (!room) return NextResponse.json({ error: "room required" }, { status: 400 });

  const cutoff = new Date(Date.now() - STALE_MS);

  // Only show recent heartbeats
  const list = await prisma.presence.findMany({
    where: { room, lastSeen: { gte: cutoff } },
    orderBy: { username: "asc" },
  });

  return NextResponse.json({ users: list.map(p => ({ username: p.username, rtcUid: p.rtcUid })) });
}
