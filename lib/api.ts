// Lightweight client helpers for EZChat API routes.
// All functions return a boolean or parsed JSON where applicable.

type Json = Record<string, unknown>;

// --- Rooms (presence lifecycle) ---

export async function joinRoom(room: string, username?: string): Promise<boolean> {
  const res = await fetch("/api/rooms/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, username }),
  });
  return res.ok;
}

export async function leaveRoom(room: string, username?: string): Promise<boolean> {
  const res = await fetch("/api/rooms/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, username }),
  });
  return res.ok;
}

export async function heartbeat(room: string, username?: string): Promise<boolean> {
  const res = await fetch("/api/rooms/heartbeat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, username }),
  });
  return res.ok;
}

// --- Chat ---

export async function fetchMessages(room: string): Promise<Json[]> {
  const res = await fetch(`/api/chat/list?room=${encodeURIComponent(room)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export async function postMessage(room: string, text: string): Promise<boolean> {
  const res = await fetch("/api/chat/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, text }),
  });
  return res.ok;
}

// --- Presence list ---

export async function fetchPresence(room: string): Promise<string[]> {
  const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}
