export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const usernameRaw: string = (body?.username ?? "").trim();
    const emailRaw: string = (body?.email ?? "").trim();
    const password: string = (body?.password ?? "").toString();

    if (!usernameRaw || !emailRaw || !password) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }
    if (!isEmail(emailRaw)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const username = usernameRaw.toLowerCase();
    const email = emailRaw.toLowerCase();

    // Uniqueness
    const conflict = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      select: { id: true, username: true, email: true },
    });
    if (conflict) {
      return NextResponse.json({ error: "username_or_email_taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, passwordHash },
      select: { id: true, username: true, email: true, createdAt: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "failed" },
      { status: 400 }
    );
  }
}
