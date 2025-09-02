// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\lib\thumbStore.ts

type Entry = { data: string; updatedAt: number };

// In-memory map. For production, back this with S3/DB/Redis.
const map = new Map<string, Entry>();

export function setThumb(room: string, dataUrl: string) {
  map.set(room, { data: dataUrl, updatedAt: Date.now() });
}

export function getThumb(room: string): Entry | undefined {
  return map.get(room);
}

// SVG fallback (no deps). Dark theme to match your UI.
export function placeholderSvg(room: string, ts: number) {
  const time = new Date(ts).toLocaleTimeString();
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="450" viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#1a1a1a"/>
      <stop offset="100%" stop-color="#0d0d0d"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <text x="24" y="56" font-family="Segoe UI, Roboto, sans-serif" font-weight="600" font-size="32" fill="#f1f5f9">
    ${esc(room)}
  </text>
  <text x="24" y="96" font-family="Segoe UI, Roboto, sans-serif" font-size="16" fill="#cbd5e1">
    Live preview • ${esc(time)}
  </text>
  <rect x="24" y="360" width="752" height="66" rx="12" fill="#111" stroke="#2a2a2a"/>
  <text x="40" y="402" font-family="Segoe UI, Roboto, sans-serif" font-size="18" fill="#9ca3af">
    Waiting for snapshot…
  </text>
</svg>`;
}
