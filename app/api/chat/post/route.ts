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

    // Normalize payload keys -> `text`
    const text =
      typeof body.text === "string"
        ? body.text
        : typeof body.content === "string"
        ? body.content
        : typeof body.message === "string"
        ? body.message
        : "";

    // Treat any provided room identifier as the roomId string
    const roomId = String(
      body.roomId ?? body.room ?? body.slug ?? ""
    ).trim().toLowerCase();

    // User id (string in your schema)
    const userId = String(
      body.userId ??
        (session?.user && (session.user as any).id) ??
        ""
    ).trim();

    // Username (your Message model requires it)
    const username =
      String(
        body.username ??
          (session?.user && (session.user as any).username) ??
          (session?.user?.email ? session.user.email.split("@")[0] : "") ??
          ""
      ).trim() || "GUEST";

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    if (!roomId) {
      return NextResponse.json({ error: "roomId is required" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { text, userId, roomId, username },
      select: {
        id: true,
        text: true,
        userId: true,
        roomId: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("chat/post error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
