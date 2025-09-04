// app/api/directory/active/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Return active rooms with counts and optional thumbs.
 * Replace this with live data; this is a deterministic mock.
 */
function make(n: number) {
  const arr = Array.from({ length: n }).map((_, i) => ({
    slug: `room-${(i + 1).toString().padStart(2, "0")}`,
    description: i % 3 === 0 ? "Drop in and say hi" : i % 3 === 1 ? "Casual hangout" : "Chill vibes",
    count: (i * 7) % 58, // pseudo count
    lastSeen: new Date(Date.now() - (i % 5) * 60000).toISOString(),
    thumbDataUrl: null as string | null,
  }));
  return arr;
}

export async function GET() {
  const rooms = make(36); // >20 so you can see paging
  return NextResponse.json(rooms);
}
