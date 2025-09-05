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
    const content =
      typeof body.text === "string"
        ? body.text
        : typeof body.content === "string"
        ? body.content
        : "";

    // Prefer body.userId; otherwise use the authenticated user's id
    const userIdRaw =
      body.userId ??
      (session?.user && (session.user as any).id) ??
      "";

    const userId = String(userIdRaw).trim();

    if (!content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { content, userId }, // ✅ userId is a string
      select: { id: true, content: true, userId: true, createdAt: true },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error("chat/post error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
