// lib/reportDirectory.ts

/**
 * A directory entry describing one room member's state.
 * Prefer providing `snapshot` (base64 data URL). If you only have a <video> element,
 * you can pass `videoEl` and we'll capture a snapshot for you.
 */
export type DirectoryEntry = {
  uid: string;
  cameraOn: boolean;
  snapshot?: string; // base64 data URL (e.g., "data:image/jpeg;base64,...")
  videoEl?: HTMLVideoElement; // legacy path (we'll render to data URL)
};

function captureFromVideoEl(videoEl: HTMLVideoElement, quality = 0.7): string | undefined {
  try {
    const w = videoEl.videoWidth || 400;
    const h = videoEl.videoHeight || 300;
    if (!w || !h) return undefined;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    ctx.drawImage(videoEl, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return undefined;
  }
}

/**
 * Report a room's current state to the directory API.
 * Usage (preferred):
 *   await reportDirectory(roomName, description, [
 *     { uid: "123", cameraOn: true, snapshot: "data:image/jpeg;base64,..." }
 *   ])
 *
 * Legacy (still supported):
 *   await reportDirectory(roomName, description, [
 *     { uid: "123", cameraOn: true, videoEl }
 *   ])
 */
export async function reportDirectory(
  roomName: string,
  description: string,
  entries: DirectoryEntry[]
): Promise<void> {
  const members = await Promise.all(
    entries.map(async (m) => {
      let thumbDataUrl: string | undefined = m.snapshot;

      // If no explicit snapshot provided but we have a <video> element, capture one
      if (!thumbDataUrl && m.cameraOn && m.videoEl instanceof HTMLVideoElement) {
        thumbDataUrl = captureFromVideoEl(m.videoEl);
      }

      // Only include thumbDataUrl if we actually have one
      return thumbDataUrl
        ? { uid: String(m.uid), cameraOn: !!m.cameraOn, thumbDataUrl }
        : { uid: String(m.uid), cameraOn: !!m.cameraOn };
    })
  );

  try {
    await fetch("/api/directory/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: roomName, description, members }),
    });
  } catch {
    // swallow errors to keep UI responsive / best-effort reporting
  }
}

/**
 * Push a single member snapshot directly to the member-thumb endpoint.
 * Useful when rendering remote users' <video> elements in your grid.
 */
export async function pushMemberSnapshot(
  roomName: string,
  uid: string,
  videoEl: HTMLVideoElement
): Promise<void> {
  const dataUrl = captureFromVideoEl(videoEl);
  if (!dataUrl) return;

  try {
    await fetch(
      `/api/directory/rooms/${encodeURIComponent(roomName)}/member/${encodeURIComponent(uid)}/thumb`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      }
    );
  } catch {
    // best-effort; ignore failures
  }
}
