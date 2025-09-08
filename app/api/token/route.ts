export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { RtcRole, RtcTokenBuilder } from "agora-access-token";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const channel = String(url.searchParams.get("channel") || "test");
  const uid = Number(url.searchParams.get("uid") || 0);
  const exp = Number(url.searchParams.get("exp") || 3600);

  const appId = process.env.AGORA_APP_ID || "";
  const appCert = process.env.AGORA_APP_CERT || "";
  if (!appId || !appCert) return new Response("Missing Agora env", { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const token = RtcTokenBuilder.buildTokenWithUid(appId, appCert, channel, uid, RtcRole.PUBLISHER, now + exp);
  return new Response(JSON.stringify({ token }), { headers: { "content-type": "application/json" } });
}
