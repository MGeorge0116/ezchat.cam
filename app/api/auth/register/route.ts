// app/api/auth/register/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // Accept JSON or form POSTs
    const ct = req.headers.get("content-type") || "";
    let payload: Record<string, any> = {};
    if (ct.includes("application/json")) {
      payload = await req.json();
    } else {
      const fd = await req.formData();
      payload = Object.fromEntries(fd as any);
    }

    const email = String(payload.email || "").trim().toLowerCase();
    const password = String(payload.password || payload.pass || "");
    const usernameInput = String(payload.username || payload.name || "").trim();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const username =
      usernameInput || (email.includes("@") ? email.split("@")[0] : "user");

    // Ensure email not already taken
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // ✅ Use passwordHash (not password); include username
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
      },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
