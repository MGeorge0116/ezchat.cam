// app/api/directory/promoted/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Return up to 5 promoted rooms.
 * Replace this with your DB query later.
 */
export async function GET() {
  const data = [
    { slug: "family-room", description: "Friendly chat for all ages", thumbDataUrl: null },
    { slug: "music-hub", description: "Share your favorite tunes", thumbDataUrl: null },
    { slug: "gaming-corner", description: "Drop in for co-op games", thumbDataUrl: null },
    { slug: "study-buddies", description: "Quiet camera study room", thumbDataUrl: null },
    { slug: "open-mic", description: "Show & tell night", thumbDataUrl: null },
  ];
  return NextResponse.json(data.slice(0, 5));
}
