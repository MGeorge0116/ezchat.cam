// app/api/rooms/[name]/snapshot/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request, { params }: { params: { name: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = params;
  const { email, base64 } = await req.json();
  const room = await prisma.room.findUnique({
    where: { name },
    include: { owner: true },
  });
  if (!room || !room.owner || room.owner.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized or room not found" }, { status: 403 });
  }
  const updated = await prisma.room.update({
    where: { name },
    data: { snapshotData: base64, snapshotUpdatedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}