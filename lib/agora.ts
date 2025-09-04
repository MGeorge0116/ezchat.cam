// lib/agora.ts
// Helper functions for interacting with Agora in EZChat

// --- RTC Token ---
// Fetch an RTC token from your server for the given channel.
// Your API should return JSON like: { token: "xxx", appId?: "override-id" }
export async function getToken(channelName: string): Promise<{ token: string; appId?: string }> {
  if (!channelName) {
    throw new Error("getToken: channelName is required")
  }

  const res = await fetch(`/api/token?channelName=${encodeURIComponent(channelName)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`getToken failed (${res.status}): ${text || res.statusText}`)
  }

  return res.json()
}

// --- Public App ID ---
// Reads your public App ID from NEXT_PUBLIC_AGORA_APP_ID
export function getPublicAppId(): string {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID
  if (!appId) {
    console.error("NEXT_PUBLIC_AGORA_APP_ID is not set")
    return ""
  }
  return appId
}
