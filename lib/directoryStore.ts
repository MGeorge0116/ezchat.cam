// Lightweight in-memory directory & thumbnails.
// For production, replace with your DB/Redis/S3.

type ReportMember = { uid: string; cameraOn: boolean; thumbDataUrl?: string };
type ReportPayload = { name: string; description?: string; members: ReportMember[] };

export type DirectoryMember = { uid: string; cameraOn: boolean };
export type DirectoryRoom = {
  name: string;
  description?: string;
  totalUsers: number;
  totalCameraOn: number;
  members: DirectoryMember[];
};

const rooms = new Map<string, DirectoryRoom>();
const memberThumbs = new Map<string, string>(); // key: `${room}::${uid}` -> dataUrl

const key = (room: string, uid: string) => `${room}::${uid}`;

export function setMemberThumb(room: string, uid: string, dataUrl: string) {
  memberThumbs.set(key(room, uid), dataUrl);
}

export function getMemberThumb(room: string, uid: string) {
  return memberThumbs.get(key(room, uid));
}

export function memberPlaceholderSvg(room: string, uid: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#0d0d0d"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <text x="16" y="40" font-family="Segoe UI, Roboto, sans-serif" font-weight="600" font-size="20" fill="#e5e7eb">
    ${esc(room)}
  </text>
  <text x="16" y="70" font-family="Segoe UI, Roboto, sans-serif" font-size="14" fill="#9ca3af">
    ${esc(uid)}
  </text>
  <rect x="16" y="240" width="368" height="44" rx="10" fill="#111" stroke="#2a2a2a"/>
  <text x="28" y="268" font-family="Segoe UI, Roboto, sans-serif" font-size="16" fill="#9ca3af">
    Waiting for snapshot…
  </text>
</svg>`;
}

export function getDirectorySnapshot(): DirectoryRoom[] {
  return Array.from(rooms.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function upsertRoomFromReport(payload: ReportPayload) {
  const { name, description, members } = payload;
  const totalUsers = members.length;
  const totalCameraOn = members.filter((m) => m.cameraOn).length;
  const room: DirectoryRoom = {
    name,
    description,
    totalUsers,
    totalCameraOn,
    members: members.map((m) => ({ uid: m.uid, cameraOn: m.cameraOn }))
  };
  rooms.set(name, room);
  // Accept optional snapshots in the same report
  members.forEach((m) => {
    if (m.thumbDataUrl) setMemberThumb(name, m.uid, m.thumbDataUrl);
  });
}
