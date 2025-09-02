import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    if (
      !email ||
      !username ||
      !password ||
      typeof email !== "string" ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const emailNorm = email.toLowerCase();

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: emailNorm }, { username }] },
    });
    if (exists) {
      return new NextResponse("Email or username already exists", { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email: emailNorm, username, password: hash },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return new NextResponse("Server error", { status: 500 });
  }
}
