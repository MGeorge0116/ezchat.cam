// lib/agora.ts
// Minimal RTC shim so Controls.tsx can build & run.
// Replace these no-ops with your real Agora SDK wiring when ready.

type RtcClient = {
  join: (room: string, username: string) => Promise<void>;
  setMicrophone: (deviceId: string) => Promise<void>;
  setCamera: (deviceId: string) => Promise<void>;
  muteMic: () => Promise<void>;
  unmuteMic: () => Promise<void>;
  enableCamera: () => Promise<void>;
  disableCamera: () => Promise<void>;
  leave: () => Promise<void>;
};

let rtcSingleton: RtcClient | null = null;

export async function ensureClients(): Promise<void> {
  if (rtcSingleton) return;
  // TODO: initialize your real Agora client here
  rtcSingleton = {
    async join() {},
    async setMicrophone() {},
    async setCamera() {},
    async muteMic() {},
    async unmuteMic() {},
    async enableCamera() {},
    async disableCamera() {},
    async leave() {},
  };
}

export function getRtcClient(): RtcClient | null {
  return rtcSingleton;
}
