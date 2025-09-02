export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";
import { getUserById, toPublicUser } from "@/lib/userStore";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get(SESSION_COOKIE)?.value || "";
    const payload = verifyToken(cookie);
    if (!payload?.uid) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await getUserById(String(payload.uid));
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user: toPublicUser(user) }, { status: 200 });
  } catch (e: unknown) {
    return NextResponse.json(
      { user: null, error: (e as Error)?.message ?? "failed" },
      { status: 200 }
    );
  }
}
