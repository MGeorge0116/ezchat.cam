// ⬅️ MUST be top-level
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { VerifyAgeBody } from "@/lib/types";
import { requireStrings } from "@/lib/guards";

export async function POST(req: NextRequest) {
  const bodyUnknown: unknown = await req.json();
  if (!requireStrings(bodyUnknown, ["userId"])) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const body = bodyUnknown as VerifyAgeBody;

  const user = await prisma.user.update({
    where: { id: body.userId },
    data: { ageVerifiedAt: new Date() },
    select: { id: true, ageVerifiedAt: true },
  });

  return NextResponse.json(user, { status: 200 });
}
