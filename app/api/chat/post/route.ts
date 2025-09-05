// app/api/chat/post/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    const body = await req.json().catch(() => ({} as any));
    const text =
      typeof body.text === "string"
        ? body.text
        : typeof body.content === "string"
        ? body.content
        : typeof body.message === "string"
        ? body.message
        : "";

    const roomSlug = String(body.room ?? body.roomSlug ?? body.slug ?? "").toLowerCase();

    const userIdRaw = body.userId ?? (session?.user && (session.user as any).id) ?? "";
    const userId = String(userIdRaw).trim();

    const username =
      String(
        body.username ??
          (session?.user && (session.user as any).username) ??
          (session?.user?.email ? session.user.email.split("@")[0] : "") ??
          ""
      ).trim() || "GUEST";

    if (!text.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
    if (!roomSlug)   return NextResponse.json({ error: "room is required" }, { status: 400 });
    if (!userId)     return NextResponse.json({ error: "userId is required" }, { status: 400 });

    // 🔧 Use findFirst so `slug` doesn't have to be unique
    const room = await prisma.room.findFirst({
      where: {
        OR: [
          { slug: roomSlug },
          { name: roomSlug },
          { id: roomSlug },
        ],
      },
      select: { id: true },
    });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const message = await prisma.message.create({
      data: { text, userId, roomId: room.id, username },
      select: { id: true, text: true, userId: true, roomId: true, username: true, createdAt: true },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("chat/post error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
