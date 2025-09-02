// web/app/api/auth/register/route.ts
export const runtime = "nodejs"; // ensure Prisma runs in Node runtime

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/auth";
import { Prisma } from "@prisma/client";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function isUsername(s: string) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body?.username ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");
    const over18 = Boolean(body?.over18);

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "username, email, and password are required" },
        { status: 400 }
      );
    }
    if (!over18) {
      return NextResponse.json(
        { error: "You must confirm you are 18+." },
        { status: 403 }
      );
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    if (!isUsername(username)) {
      return NextResponse.json(
        { error: "Username must be 3–20 chars (letters, numbers, underscore)" },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        ageVerifiedAt: new Date(), // 18+ flag
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: user.id });
  } catch (err: any) {
    // Prisma-specific helpful errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        // Unique constraint
        const target = Array.isArray((err as any).meta?.target)
          ? (err as any).meta.target.join(", ")
          : (err as any).meta?.target || "field";
        return NextResponse.json({ error: `That ${target} is already taken.` }, { status: 409 });
      }
      if (err.code === "P2011" || err.code === "P2004") {
        const msg = String(err.message || "");
        // Not-null constraint is the usual culprit when an old dateOfBirth column remains
        if (msg.includes("not null") || msg.toLowerCase().includes("dateofbirth")) {
          return NextResponse.json(
            { error: "Database still requires 'dateOfBirth'. Sync your Prisma schema (see console)." },
            { status: 500 }
          );
        }
      }
    }

    console.error("register POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
