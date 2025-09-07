export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const room = url.searchParams.get("room")?.toLowerCase();
  if (!room) return NextResponse.json({ messages: [] });

  const messages = await prisma.message.findMany({
    where: { room: { name: room } },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, text: true, createdAt: true, username: true },
  });

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      text: m.text,
      username: m.username,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}
