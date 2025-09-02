import { NextRequest, NextResponse } from "next/server";
import { getDirectorySnapshot, upsertRoomFromReport } from "../../../../lib/directoryStore";

/**
 * GET  /api/directory/rooms
 *   -> { rooms: DirectoryRoom[] }
 *
 * POST /api/directory/rooms
 *   Body: {
 *     name: string,
 *     description?: string,
 *     members: { uid: string, cameraOn: boolean, thumbDataUrl?: string }[]
 *   }
 *   -> upserts the room + member states; if thumbDataUrl present for a member
 *      it is saved and served by the member-thumb endpoint below.
 */

export async function GET() {
  const rooms = getDirectorySnapshot();
  return NextResponse.json({ rooms });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, members } = body || {};
    if (!name || !Array.isArray(members)) {
      return NextResponse.json({ error: "Missing name or members[]" }, { status: 400 });
    }
    await upsertRoomFromReport({ name, description, members });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Bad JSON" }, { status: 400 });
  }
}
