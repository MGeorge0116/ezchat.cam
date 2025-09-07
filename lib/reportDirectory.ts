// lib/reportDirectory.ts
export type DirectoryRoom = {
  username: string;
  isLive: boolean;
  promoted: boolean;
  watching: number;
  broadcasters: number;      // NEW
  avatarDataUrl?: string;
  description?: string;
  lastSeen: number;
};

function s(v: any, d = ""): string { return typeof v === "string" ? v : v == null ? d : String(v); }
function n(v: any, d = 0): number { const x = typeof v === "number" ? v : Number(v); return Number.isFinite(x) ? x : d; }

export function listActiveRooms(): DirectoryRoom[] {
  try {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("room:meta:") && !k.endsWith(":promoted") && !k.endsWith(":watching")
    );
    const out: DirectoryRoom[] = [];
    for (const k of keys) {
      let raw: any = {}; try { raw = JSON.parse(localStorage.getItem(k) || "{}"); } catch {}
      const keyUser = k.slice("room:meta:".length).toLowerCase();
      const username = s(raw.username, keyUser).trim().toLowerCase(); if (!username) continue;

      const profileAvatar = localStorage.getItem(`profile:avatar:${username}`) || "";
      const profileDesc   = localStorage.getItem(`profile:desc:${username}`) || "";

      out.push({
        username,
        isLive: !!raw.isLive,
        promoted: !!raw.promoted,
        watching: n(raw.watching, 0),
        broadcasters: n(raw.broadcasters, 0),
        avatarDataUrl: s(raw.avatarDataUrl, "") || profileAvatar,
        description: s(raw.description, "") || profileDesc,
        lastSeen: n(raw.lastSeen, 0),
      });
    }
    // dedupe + sort
    const dedup = new Map<string, DirectoryRoom>();
    for (const r of out) {
      const p = dedup.get(r.username);
      if (!p || r.lastSeen >= p.lastSeen) dedup.set(r.username, r);
    }
    return Array.from(dedup.values()).sort(
      (a, b) => Number(b.isLive) - Number(a.isLive) || b.lastSeen - a.lastSeen
    );
  } catch { return []; }
}
export function reportDirectory() { return listActiveRooms(); }
