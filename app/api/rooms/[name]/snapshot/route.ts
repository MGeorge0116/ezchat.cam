// app/api/rooms/[name]/snapshot/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms/:name/snapshot
export async function GET(req: NextRequest) {
  // Parse the dynamic segment from the path instead of using the typed context arg
  const pathname = req.nextUrl?.pathname || new URL(req.url).pathname;
  const match = pathname.match(/\/api\/rooms\/([^/]+)\/snapshot$/);
  const slug = match ? decodeURIComponent(match[1]) : "";

  if (!slug) {
    return NextResponse.json({ error: "Missing room name" }, { status: 400 });
  }

  // Your Prisma model's unique key is `id`, so look up by id
  const room = await prisma.room.findUnique({
    where: { id: slug },
    select: { ownerId: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Keep prior API shape: echo the URL segment as `slug`
  return NextResponse.json({ slug, ownerId: room.ownerId }, { status: 200 });
}
