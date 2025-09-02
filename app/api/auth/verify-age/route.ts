export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  // Read your custom session cookie and verify the JWT
  const token = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  const payload = verifyToken(token);

  if (!payload?.uid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: String(payload.uid) },
    data: { ageVerifiedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
