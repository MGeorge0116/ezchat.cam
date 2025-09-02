import { NextResponse } from "next/server";
import { upsertRoom } from "@/lib/rooms";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const room = String(body.room || "").trim();
    const title = typeof body.title === "string" ? body.title : undefined;
    const usersCount =
      typeof body.usersCount === "number" ? body.usersCount : undefined;
    const camsCount =
      typeof body.camsCount === "number" ? body.camsCount : undefined;

    if (!room) {
      return NextResponse.json({ error: "Missing 'room'" }, { status: 400 });
    }

    upsertRoom(room, title, usersCount, camsCount);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
