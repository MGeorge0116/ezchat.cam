// app/api/agora/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import { SESSION_COOKIE, verifyToken } from "../../../../lib/session";
import { getUserById } from "../../../../lib/userStore";

function env(name: string, req = true) {
  const v = process.env[name];
  if (req && !v) throw new Error(`Missing env ${name}`);
  return String(v || "");
}

export async function POST(req: NextRequest) {
  try {
    const { channelName, expireSeconds = 60 * 60 * 24 } = await req.json();

    if (!channelName || typeof channelName !== "string") {
      return NextResponse.json({ error: "missing_channelName" }, { status: 400 });
    }

    // 1) Authenticate via session cookie
    const cookie = req.cookies.get(SESSION_COOKIE)?.value || "";
    const payload = verifyToken(cookie);
    if (!payload?.uid) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const user = getUserById(String(payload.uid));
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2) ENFORCE: my room = my username
    if (channelName.toLowerCase() !== user.username.toLowerCase()) {
      return NextResponse.json({ error: "forbidden_room" }, { status: 403 });
    }

    // 3) Build Agora RTC token (account-based)
    const appId = env("AGORA_APP_ID");
    const appCert = env("AGORA_APP_CERTIFICATE");
    const role = RtcRole.PUBLISHER;
    const now = Math.floor(Date.now() / 1000);
    const privilegeExpireTs = now + Math.max(60, Math.min(7 * 24 * 3600, Number(expireSeconds)));

    // Use stable string account (user.id). You may use username instead if you prefer.
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
      token,
      channelName,
      rtcAccount,
      expiresAt: privilegeExpireTs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "bad_request", detail: err?.message || "failed" },
      { status: 400 }
    );
  }
}

// Optional: GET /api/agora/token?channelName=foo (for quick testing)
export async function GET(req: NextRequest) {
  const channelName = req.nextUrl.searchParams.get("channelName");
  if (!channelName) {
    return NextResponse.json({ error: "missing_channelName" }, { status: 400 });
  }
  return POST(
    new NextRequest(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ channelName }),
    })
  );
}
