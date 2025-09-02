import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig, prisma } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authConfig);
  const userId = (session as any)?.userId;
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await prisma.user.update({
    where: { id: String(userId) },
    data: { ageVerifiedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
