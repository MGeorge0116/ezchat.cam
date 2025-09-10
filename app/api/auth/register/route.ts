// ⬅️ MUST be top-level and first thing in the file
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStrings } from "@/lib/guards";
import type { RegisterBody } from "@/lib/types";
import crypto from "crypto";

async function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function POST(req: NextRequest) {
  const dataUnknown: unknown = await req.json();
  if (!requireStrings(dataUnknown, ["email", "username", "password"])) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const data = dataUnknown as RegisterBody;

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username.toLowerCase(),
      passwordHash,
    },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
