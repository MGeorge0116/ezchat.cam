// app/api/auth/verify-age/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

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

    // ✅ Set cookie on the response (works in Next 15 route handlers)
    const res = NextResponse.json({ verified, age: ageNum });
    res.cookies.set({
      name: "age_verified",
      value: verified ? "1" : "0",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    return res;
  } catch (err) {
    console.error("verify-age error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
