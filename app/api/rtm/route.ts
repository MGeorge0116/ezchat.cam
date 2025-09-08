export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { RtmTokenBuilder, RtmRole } from "agora-token";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const uid = String(url.searchParams.get("uid") || "guest");
  const exp = Number(url.searchParams.get("exp") || 3600);

  const appId = process.env.AGORA_APP_ID || "";
  const appCert = process.env.AGORA_APP_CERT || "";
  if (!appId || !appCert) return new Response("Missing Agora env", { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const token = RtmTokenBuilder.buildToken(appId, appCert, uid, RtmRole.Rtm_User, now + exp);
  return new Response(JSON.stringify({ token }), { headers: { "content-type": "application/json" } });
}
