// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username, email, password, ageVerified } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!ageVerified) {
      return NextResponse.json(
        { error: "You must confirm you are 18 or older." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] },
    });
    if (exists) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
