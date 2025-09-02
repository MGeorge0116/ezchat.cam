// lib/agora.ts
// Safe, client-only init for Agora RTC + (optional) RTM

let rtcClient: any = null;
let rtmClient: any = null;
let rtmChannel: any = null;

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || "";

/** Try every known way RTM exposes createInstance, plus window fallback. */
async function tryResolveRtmFactory(): Promise<((appId: string) => any) | null> {
  if (typeof window === "undefined") return null;

  try {
    const mod: any = await import("agora-rtm-sdk"); // ESM entry

    // common shapes
    const candidates = [
      mod?.default?.createInstance,
      mod?.createInstance,
      // some builds expose the namespace under default.AgoraRTM
      mod?.default?.AgoraRTM?.createInstance,
      mod?.AgoraRTM?.createInstance,
      // extremely old/UMD builds attached to window
      (window as any)?.AgoraRTM?.createInstance,
    ].filter(Boolean);

    if (candidates.length > 0) {
      const fn = candidates[0];
      if (typeof fn === "function") return fn;
    }
  } catch (e) {
    // ignore; we’ll fall back to window
  }

  // Final window fallback (if the package was loaded via <script> elsewhere)
  const winFactory = (window as any)?.AgoraRTM?.createInstance;
  return typeof winFactory === "function" ? winFactory : null;
}

export async function ensureClients() {
  if (typeof window === "undefined") return; // SSR-safe

  if (!APP_ID) {
    console.warn("NEXT_PUBLIC_AGORA_APP_ID is not set; RTC/RTM will fail.");
    return;
  }

  // RTC (video/audio)
  if (!rtcClient) {
    const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");
    rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  }

  // RTM (text chat) – OPTIONAL
  if (!rtmClient) {
    const factory = await tryResolveRtmFactory();
    if (factory) {
      try {
        rtmClient = factory(APP_ID);
      } catch (e) {
        console.warn("Agora RTM factory threw on create:", e);
        rtmClient = null;
      }
    } else {
      console.warn("Unable to resolve AgoraRTM.createInstance; continuing without RTM.");
      rtmClient = null;
    }
  }
}

export function rtmAvailable() {
  return !!rtmClient;
}

export function getRtcClient() {
  if (!rtcClient) throw new Error("RTC client not initialized");
  return rtcClient;
}
export function getRtmClient() {
  return rtmClient; // may be null
}
export function getRtmChannel() {
  return rtmChannel || null;
}

export async function joinRtc(channelName: string, uid?: string | number) {
  const client = getRtcClient();
  const u = await client.join(APP_ID, channelName, null, uid ?? null);
  return u;
}

export async function joinRtm(channelName: string, uid: string) {
  // Make RTM optional: if not available, no-ops so the UI can keep working.
  if (!rtmClient) return null;
  await rtmClient.login({ uid, token: undefined });
  rtmChannel = rtmClient.createChannel(channelName);
  await rtmChannel.join();
  return rtmChannel;
}

export async function leaveAll() {
  try { if (rtmChannel) { await rtmChannel.leave(); rtmChannel = null; } } catch {}
  try { if (rtmClient?.logout) { await rtmClient.logout(); } } catch {}
  try {
    if (rtcClient) {
      const localTracks: any[] = (rtcClient as any).localTracks || [];
      for (const t of localTracks) {
        try { t.stop?.(); } catch {}
        try { t.close?.(); } catch {}
      }
      (rtcClient as any).localTracks = [];
      await rtcClient.leave();
    }
  } catch {}
}
