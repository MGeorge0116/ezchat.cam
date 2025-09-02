export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import { SESSION_COOKIE, verifyToken } from "@/lib/session";
import { getUserById } from "@/lib/userStore";

/** Read one of several env var names (so your old/new names both work) */
function requireOne(names: string[]) {
  for (const n of names) {
    const v = process.env[n];
    if (v && String(v).trim()) return String(v);
  }
  throw new Error(`Missing env ${names.join(" or ")}`);
}

/**
 * POST /api/token
 * Body: { channelName: string, expireSeconds?: number }
 *
 * Returns: { token, channelName, rtcAccount, expiresAt }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const channelName: unknown = body?.channelName;
    const expireSeconds: number = Number(body?.expireSeconds ?? 60 * 60 * 24);

    if (!channelName || typeof channelName !== "string") {
      return NextResponse.json(
        { error: "missing_channelName" },
        { status: 400 }
      );
    }

    // Authenticate via your session cookie
    const cookie = req.cookies.get(SESSION_COOKIE)?.value || "";
    const payload = verifyToken(cookie);
    if (!payload?.uid) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const user = getUserById(String(payload.uid));
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Enforce: a user can only request a token for their own room
    if (channelName.toLowerCase() !== user.username.toLowerCase()) {
      return NextResponse.json({ error: "forbidden_room" }, { status: 403 });
    }

    // Build Agora RTC token (account-based)
    const appId = requireOne(["AGORA_APP_ID", "NEXT_PUBLIC_AGORA_APP_ID"]);
    const appCert = requireOne(["AGORA_APP_CERTIFICATE", "AGORA_APP_CERT"]);
    const role = RtcRole.PUBLISHER;

    const now = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = now + Math.max(60, Math.min(7 * 24 * 3600, expireSeconds));

    // Use a stable account string; your user.id is fine
    const rtcAccount = String(user.id);

    const token = RtcTokenBuilder.buildTokenWithAccount(
      appId,
      appCert,
      channelName,
      rtcAccount,
      role,
      privilegeExpireTs
    );

    return NextResponse.json(
      { token, channelName, rtcAccount, expiresAt: privilegeExpireTs },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "bad_request", detail: err?.message || "failed" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/token?channelName=foo
 * Convenience endpoint for quick testing.
 */
export async function GET(req: NextRequest) {
  const channelName = req.nextUrl.searchParams.get("channelName");
  if (!channelName) {
    return NextResponse.json({ error: "missing_channelName" }, { status: 400 });
  }
  // Reuse POST logic by crafting a Request with the JSON body
  return POST(
    new NextRequest(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ channelName }),
    })
  );
}
