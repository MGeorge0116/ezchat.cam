// lib/client/logout.ts
export async function localLogoutCleanup() {
  if (typeof window === "undefined") return;

  const username =
    localStorage.getItem("auth:username") ||
    localStorage.getItem("profile:username") ||
    localStorage.getItem("ui:username") ||
    "";

  const room =
    localStorage.getItem("room:last") ||
    (username ? username.toLowerCase() : "");

  // Best-effort presence cleanup
  if (room && username) {
    try {
      await fetch("/api/rooms/leave", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ room, username }),
        keepalive: true,
      });
    } catch {
      /* ignore */
    }
  }

  // Remove directory heartbeat keys so cards disappear quickly
  if (username) {
    try {
      localStorage.removeItem(`room:meta:${username}`);
      localStorage.removeItem(`room:meta:${username}:promoted`);
      localStorage.removeItem(`room:meta:${username}:watching`);
    } catch {
      /* ignore */
    }
  }

  // Core auth markers used across the app
  [
    "auth:username",
    "auth:email",
    "ui:username",
    "profile:username",
    "room:last",
  ].forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}
