export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = context?.params?.name as string | undefined;
  if (!name) return NextResponse.json({ error: "Missing room name" }, { status: 400 });

  const slug = name.toLowerCase();
  const room = await prisma.room.findUnique({ where: { slug } });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // Expand with real stats if you have them
  return NextResponse.json({ slug: room.slug, ownerId: room.ownerId });
}
