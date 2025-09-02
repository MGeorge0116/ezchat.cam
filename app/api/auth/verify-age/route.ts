export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authConfig);

  // prefer userId from JWT (set in callbacks), fallback to email
  const userId = (session as any)?.userId as string | undefined;
  const email = session?.user?.email as string | undefined;

  if (!userId && !email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (userId) {
    await prisma.user.update({
      where: { id: String(userId) },
      data: { ageVerifiedAt: new Date() },
    });
  } else {
    await prisma.user.update({
      where: { email: String(email) },
      data: { ageVerifiedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
