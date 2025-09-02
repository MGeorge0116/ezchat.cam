export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

/**
 * POST /api/token
 * Body: { channelName: string, expireSeconds?: number }
 * Auth: required; user can only request token for their own room (channelName === username)
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      channelName?: string;
      expireSeconds?: number;
    };

    const channelName = (body.channelName || "").trim();
    if (!channelName) {
      return NextResponse.json({ error: "missing_channelName" }, { status: 400 });
    }

    // 1) Auth via our session cookie
    const cookie = req.cookies.get(SESSION_COOKIE)?.value ?? "";
    const payload = verifyToken(cookie);
    if (!payload?.uid) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2) Load the user (be sure to AWAIT)
    const user = await prisma.user.findUnique({
      where: { id: String(payload.uid) },
      select: { id: true, username: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 3) Enforce: a user can only request a token for their own room
    if (channelName.toLowerCase() !== user.username.toLowerCase()) {
      return NextResponse.json({ error: "forbidden_room" }, { status: 403 });
    }

    // 4) Build Agora RTC token
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || requiredEnv("AGORA_APP_ID");
    const appCert = requiredEnv("AGORA_APP_CERTIFICATE");

    const role = RtcRole.PUBLISHER;
    const now = Math.floor(Date.now() / 1000);
    const expireSeconds = Math.max(60, Math.min(7 * 24 * 3600, Number(body.expireSeconds ?? 3600)));
    const privilegeExpireTs = now + expireSeconds;

    // Use stable account id for token binding
    const rtcAccount = user.id;

    const token = RtcTokenBuilder.buildTokenWithAccount(
      appId,
      appCert,
      channelName,
      rtcAccount,
      role,
      privilegeExpireTs
    );

    return NextResponse.json({
      ok: true,
      token,
      channelName,
      rtcAccount,
      expiresAt: privilegeExpireTs,
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "failed" },
      { status: 400 }
    );
  }
}

/** Optional GET for quick testing: /api/token?channelName=foo */
export async function GET(req: NextRequest) {
  const channelName = req.nextUrl.searchParams.get("channelName");
  if (!channelName) {
    return NextResponse.json({ error: "missing_channelName" }, { status: 400 });
  }
  // Reuse POST logic
  return POST(
    new NextRequest(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ channelName }),
    })
  );
}
