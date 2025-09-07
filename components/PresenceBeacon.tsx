"use client";

import { useEffect } from "react";

export default function PresenceBeacon({
  room,
  username,
  intervalMs = 10000,
}: {
  room: string;
  username?: string;
  intervalMs?: number;
}) {
  useEffect(() => {
    let timer: number | null = null;

    const ping = async () => {
      try {
        await fetch("/api/rooms/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room, username }),
          cache: "no-store",
        });
      } catch {}
    };

    ping();
    timer = window.setInterval(ping, intervalMs);

    // best-effort on unload
    const unload = () => {
      try {
        const data = JSON.stringify({ room, username });
        navigator.sendBeacon?.("/api/rooms/heartbeat", data);
      } catch {}
    };
    window.addEventListener("pagehide", unload);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") unload();
    });

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener("pagehide", unload);
    };
  }, [room, username, intervalMs]);

  return null;
}
