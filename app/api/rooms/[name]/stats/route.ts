import { NextRequest, NextResponse } from "next/server";
import type { RoomStatsResponse } from "@/lib/types";
import { getRoomStats } from "@/lib/rooms";

export async function GET(
  _req: NextRequest,
  { params }: { params: { name: string } }
) {
  const room = params.name;
  const s = await getRoomStats(room);
  const payload: RoomStatsResponse = {
    room,
    broadcasters: s.broadcasters,
    users: s.users,
  };
  return NextResponse.json(payload);
}
