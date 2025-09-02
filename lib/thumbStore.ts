// lib/thumbStore.ts
// Simple in-memory thumbnail store for room snapshots.
// NOTE: This is ephemeral (resets on cold start). For production persistence,
// back this with a DB/blob store (S3, R2, Prisma table, etc.).

const roomThumbs = new Map<string, string>(); // key = normalized room name

function norm(name: string) {
  return String(name || "").trim().toLowerCase();
}

/** Save a room snapshot as a data URL (png/jpeg/webp). */
export function setRoomThumb(roomName: string, dataUrl: string): void {
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(String(dataUrl))) return;
  roomThumbs.set(norm(roomName), String(dataUrl));
}

/** Retrieve a previously saved data URL for a room (or null). */
export function getRoomThumb(roomName: string): string | null {
  return roomThumbs.get(norm(roomName)) ?? null;
}

/** SVG placeholder if no snapshot exists. */
export function roomPlaceholderSvg(roomName: string): string {
  const r = roomName?.trim() || "Room";
  const initial = r.slice(0, 1).toUpperCase();
  // simple hashed hue for variety
  let hash = 0;
  for (let i = 0; i < r.length; i++) hash = (hash * 31 + r.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  const bg = `hsl(${hue} 45% 20%)`;
  const fg = `hsl(${hue} 70% 92%)`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="320" height="180" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="hsl(${hue} 45% 28%)"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="320" height="180" fill="url(#g)"/>
  <circle cx="160" cy="90" r="52" fill="none" stroke="${fg}" stroke-width="6" opacity="0.8"/>
  <text x="160" y="100" text-anchor="middle" font-family="Inter, system-ui, sans-serif"
        font-size="56" font-weight="700" fill="${fg}">${initial}</text>
</svg>`;
}
