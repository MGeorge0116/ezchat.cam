import { NextRequest, NextResponse } from "next/server"
import { RtcRole, RtcTokenBuilder } from "agora-access-token"

// Utility to enforce required environment variables
function requiredEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing environment variable: ${name}`)
  return v
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const channelName = url.searchParams.get("channelName")

    if (!channelName) {
      return NextResponse.json({ error: "Missing channelName" }, { status: 400 })
    }

    const appId = requiredEnv("NEXT_PUBLIC_AGORA_APP_ID")
    const appCertificate = requiredEnv("AGORA_APP_CERTIFICATE")
    const expiration = parseInt(process.env.AGORA_TOKEN_EXPIRES || "3600", 10)

    const uid = 0 // Let Agora assign UID automatically
    const current = Math.floor(Date.now() / 1000)
    const privilegeExpire = current + expiration

    // Build RTC token with Agora SDK
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpire
    )

    return NextResponse.json({ token, appId })
  } catch (err: any) {
    console.error("Token route error:", err)
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 })
  }
}
