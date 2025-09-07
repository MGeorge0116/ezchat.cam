// app/api/directory/rooms/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/directory/rooms
 * Optional query params:
 *   - limit: number of rooms to return (default 50)
 *   - promoted: accepted for compatibility but ignored (no such field in schema)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Keep the param for compatibility, but don't use it (no `promoted` in schema)
    // const promoted = searchParams.get("promoted") === "true";

    const limitRaw = searchParams.get("limit");
    const take =
      Number.isFinite(Number(limitRaw)) && Number(limitRaw) > 0
        ? Math.min(100, Number(limitRaw))
        : 50;

    // No orderBy field guaranteed by your schema, so omit ordering entirely.
    const rooms = await prisma.room.findMany({
      take,
    });

    return NextResponse.json({ rooms }, { status: 200 });
  } catch (err) {
    console.error("directory/rooms GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
