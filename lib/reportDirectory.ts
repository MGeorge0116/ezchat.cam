// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\lib\reportDirectory.ts

/**
 * Report a room's current state to the directory API.
 * - Optionally includes a thumbnail for any member that has a <video> element.
 * - Safe to call frequently (e.g., on publish/unpublish and on a timer).
 */
export async function reportDirectory(
  roomName: string,
  description: string,
  members: { uid: string; cameraOn: boolean; videoEl?: HTMLVideoElement }[]
) {
  const withThumbs = await Promise.all(
    members.map(async (m) => {
      if (!m.cameraOn || !m.videoEl) return { uid: m.uid, cameraOn: m.cameraOn };
      try {
        const canvas = document.createElement("canvas");
        canvas.width = m.videoEl.videoWidth || 400;
        canvas.height = m.videoEl.videoHeight || 300;
        const ctx = canvas.getContext("2d");
        if (!ctx) return { uid: m.uid, cameraOn: m.cameraOn };
        ctx.drawImage(m.videoEl, 0, 0, canvas.width, canvas.height);
        const thumbDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        return { uid: m.uid, cameraOn: m.cameraOn, thumbDataUrl };
      } catch {
        return { uid: m.uid, cameraOn: m.cameraOn };
      }
    })
  );

  await fetch("/api/directory/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: roomName, description, members: withThumbs }),
  });
}

/**
 * Push a single member snapshot directly to the member-thumb endpoint.
 * This is useful for remote users whose <video> elements you render in the grid.
 */
export async function pushMemberSnapshot(
  roomName: string,
  uid: string,
  videoEl: HTMLVideoElement
) {
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth || 400;
  canvas.height = videoEl.videoHeight || 300;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

  await fetch(
    `/api/directory/rooms/${encodeURIComponent(roomName)}/member/${encodeURIComponent(
      uid
    )}/thumb`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataUrl }),
    }
  );
}
