export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await req.json();
  const owner = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!owner) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const room = await prisma.room.upsert({
    where: { slug },
    update: { slug },
    create: { slug, name: slug, ownerId: owner.id },
    select: { slug: true, ownerId: true },
  });

  return NextResponse.json({ slug: room.slug });
}
