// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\app\api\auth\me\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserById, toPublicUser } from "../../../../lib/userStore";
import { SESSION_COOKIE, verifyToken } from "../../../../lib/session";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  const payload = verifyToken(token);
  if (!payload?.uid) return NextResponse.json({ user: null }, { status: 200 });

  const user = getUserById(String(payload.uid));
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({ user: toPublicUser(user) }, { status: 200 });
}
