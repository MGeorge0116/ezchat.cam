// app/api/auth/verify-age/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const userId = String(body.userId ?? body.id ?? "").trim(); // ✅ keep as string
    const ageRaw = body.age;
    const age =
      typeof ageRaw === "number"
        ? ageRaw
        : Number.isFinite(Number(ageRaw))
        ? Number(ageRaw)
        : undefined;

    if (!userId || age === undefined) {
      return NextResponse.json(
        { error: "userId and age are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId }, // ✅ string id
      data: { age },         // assumes `age` is an Int in your schema
      select: { id: true, email: true, username: true, age: true },
    });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("verify-age error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
