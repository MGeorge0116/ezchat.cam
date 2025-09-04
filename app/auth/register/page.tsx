export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function bad(msg: string, code = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status: code,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, isOver18 } = await req.json();

    // Basic validation
    const em = String(email || "").trim().toLowerCase();
    const un = String(username || "").trim().toLowerCase();
    const pw = String(password || "");
    const over18 = Boolean(isOver18);

    if (!em) return bad("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return bad("Invalid email.");
    if (!un) return bad("Username is required.");
    if (!/^[a-z0-9._-]{3,32}$/.test(un)) return bad("Username must be 3–32 chars (a–z, 0–9, . _ -).");
    if (pw.length < 8) return bad("Password must be at least 8 characters.");
    if (!over18) return bad("You must confirm you are 18 or older.");

    // Uniqueness checks
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: em }, { username: un }] },
      select: { id: true, email: true, username: true },
    });
    if (existing) {
      if (existing.email === em) return bad("Email already in use.", 409);
      if (existing.username === un) return bad("Username already taken.", 409);
      return bad("Account already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(pw, 12);

    const user = await prisma.user.create({
  data: {
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
  },
});


    return new Response(JSON.stringify({ ok: true, user }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("register error:", err);
    return bad("Unexpected error.", 500);
  }
}
