export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const room = (url.searchParams.get("room") || "").toLowerCase().trim();
  if (!room) return NextResponse.json({ error: "missing_room" }, { status: 400 });

  // Only show users active in the last 30s
  const cutoff = new Date(Date.now() - 30_000);

  const list = await prisma.presence.findMany({
    where: { room, lastSeen: { gte: cutoff } },
    orderBy: { username: "asc" },
    select: { username: true, userId: true, lastSeen: true },
  });

  return NextResponse.json({
    users: list.map((u) => ({
      username: u.username,
      userId: u.userId,
      lastSeen: u.lastSeen.toISOString(),
    })),
  });
}
