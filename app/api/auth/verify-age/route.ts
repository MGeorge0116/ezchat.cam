// app/api/auth/verify-age/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    // Accept common shapes: { userId, age } or form-like
    const ageRaw = body.age ?? body.value ?? body.ageYears;
    const ageNum =
      typeof ageRaw === "number"
        ? ageRaw
        : Number.isFinite(Number(ageRaw))
        ? Number(ageRaw)
        : NaN;

    if (!Number.isFinite(ageNum)) {
      return NextResponse.json({ error: "age is required" }, { status: 400 });
    }

    const verified = ageNum >= 18;

    // Set a simple gate cookie for UI/edge checks (1 year)
    cookies().set("age_verified", verified ? "1" : "0", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    // Return minimal payload; no DB write (your schema has no `age` column)
    return NextResponse.json({ verified, age: ageNum });
  } catch (err) {
    console.error("verify-age error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
