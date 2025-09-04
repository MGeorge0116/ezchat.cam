// app/api/rooms/my/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const email = session.user.email.toLowerCase();
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return NextResponse.redirect(new URL("/", req.url));

  const slug = (user.username || email.split("@")[0]).toLowerCase();

  let room = await prisma.room.findUnique({ where: { name: slug } });
  if (!room) {
    room = await prisma.room.create({
      data: {
        name: slug,
        title: `${user.username}'s Room`,
        ownerId: user.id,
      },
    });
  }

  return NextResponse.redirect(new URL(`/room/${room.name}`, req.url));
}
