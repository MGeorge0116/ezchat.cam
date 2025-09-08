import { NextResponse } from "next/server";
import { getRoom } from "@/lib/rooms"; // see helper below

export async function GET(req: Request, ctx: any) {
  const name = ctx?.params?.name?.toString().toLowerCase?.();
  if (!name) {
    return NextResponse.json({ error: "Missing room name" }, { status: 400 });
  }

  const room = await getRoom(name);
  const data = room
    ? { viewers: room.viewers, broadcasters: room.broadcasters }
    : { viewers: 0, broadcasters: 0 };

  return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
}
