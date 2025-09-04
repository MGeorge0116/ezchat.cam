// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Parse body once
    const body = await req.json();
    const usernameRaw = typeof body.username === "string" ? body.username.trim() : "";
    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const passwordRaw = typeof body.password === "string" ? body.password : "";
    const ageVerified = Boolean(body.ageVerified);

    // Basic validation
    if (!usernameRaw || !emailRaw || !passwordRaw) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!ageVerified) {
      return NextResponse.json(
        { error: "You must confirm you are 18 or older." },
        { status: 400 }
      );
    }
    if (passwordRaw.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Normalize
    const username = usernameRaw.toLowerCase();
    const email = emailRaw.toLowerCase();

    // Check for existing user by email OR username
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: { id: true, email: true, username: true },
    });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return NextResponse.json(
        { error: `That ${field} is already registered.` },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    // Create user (⚠️ expects your Prisma User model has: email, username, passwordHash)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        // If your schema includes this field, you may add it back:
        // ageVerifiedAt: new Date(),
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 200 });
  } catch (err: unknown) {
    // Handle known Prisma errors (e.g., duplicate key race)
    if (err && typeof err === "object" && "code" in (err as any)) {
      const pErr = err as Prisma.PrismaClientKnownRequestError;
      if (pErr.code === "P2002") {
        // Unique constraint violation
        const meta = (pErr.meta as any) || {};
        const target = Array.isArray(meta.target) ? meta.target.join(", ") : "field";
        return NextResponse.json(
          { error: `An account with that ${target} already exists.` },
          { status: 400 }
        );
      }
    }

    console.error("Registration error details:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
