export const runtime = "nodejs";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
  await prisma.user.update({ where: { id: String(userId) }, data: { ageVerifiedAt: new Date() } });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
