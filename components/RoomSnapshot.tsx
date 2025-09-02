"use client";

import React from "react";
import AgoraRTC, { IAgoraRTCClient, IRemoteUser } from "agora-rtc-sdk-ng";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

type Props = {
  room: string;
  className?: string; // Tailwind classes for size (square)
  intervalMs?: number; // default 10s
};

/**
 * RoomSnapshot
 * - Every interval (default 10s), briefly joins the channel (no publish),
 *   subscribes to the first remote VIDEO it finds, draws a single frame to a <canvas>,
 *   then leaves. Keeps resource usage low while giving fresh snapshots.
 */
export default function RoomSnapshot({
  room,
  className,
  intervalMs = 10_000,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [tick, setTick] = React.useState(0);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  // Only run snapshots when visible
  React.useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        setVisible(e.isIntersecting && e.intersectionRatio > 0.25);
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Timer
  React.useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setTick((x) => x + 1), intervalMs);
    // also trigger immediately the first time it becomes visible
    setTick((x) => x + 1);
    return () => clearInterval(id);
  }, [visible, intervalMs]);

  // Take snapshot on each tick
  React.useEffect(() => {
    if (!APP_ID || !room || !visible) return;
    let cancelled = false;

    (async () => {
      let client: IAgoraRTCClient | null = null;
      let tempVideoEl: HTMLVideoElement | null = null;

      try {
        // Get a token for the channel
        const uid = Math.floor(Math.random() * 1e9);
        const res = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: room, uid }),
        });
        if (!res.ok) return;
        const { token } = await res.json();

        client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        const gotVideoOnce = new Promise<void>((resolve) => {
          client!.on("user-published", async (user: IRemoteUser, mediaType) => {
            if (mediaType !== "video") return;
            await client!.subscribe(user, "video");
            if (user.videoTrack) {
              // Play into a hidden video element
              tempVideoEl = document.createElement("video");
              tempVideoEl.style.position = "fixed";
              tempVideoEl.style.left = "-10000px";
              document.body.appendChild(tempVideoEl);
              user.videoTrack.play(tempVideoEl);
              // Give it a frame then draw to canvas
              setTimeout(() => {
                drawToCanvas(tempVideoEl!, canvasRef.current);
                resolve();
              }, 200);
            }
          });
        });

        await client.join(APP_ID, room, token, uid);

        // Subscribe to any existing remote user with video
        for (const u of client.remoteUsers) {
          if (u.hasVideo) {
            await client.subscribe(u, "video");
            if (u.videoTrack) {
              tempVideoEl = document.createElement("video");
              tempVideoEl.style.position = "fixed";
              tempVideoEl.style.left = "-10000px";
              document.body.appendChild(tempVideoEl);
              u.videoTrack.play(tempVideoEl);
              setTimeout(() => {
                drawToCanvas(tempVideoEl!, canvasRef.current);
              }, 200);
              break;
            }
          }
        }

        // If we didn't catch a pre-existing user, wait briefly for publish event
        if (!tempVideoEl) {
          await Promise.race([gotVideoOnce, timeout(1500)]);
        }
      } catch {
        // ignore
      } finally {
        // Cleanup: stop hidden video, leave channel
        try {
          if (tempVideoEl) {
            tempVideoEl.srcObject = null;
            tempVideoEl.remove();
          }
          if (client) await client.leave();
        } catch {}
      }
    })();

    function drawToCanvas(video: HTMLVideoElement, canvas?: HTMLCanvasElement | null) {
      if (!canvas) return;
      const size = Math.min(video.videoWidth || 320, video.videoHeight || 240);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // cover behavior to keep square crop
      const sx = Math.max(0, (video.videoWidth - size) / 2);
      const sy = Math.max(0, (video.videoHeight - size) / 2);
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    }

    function timeout(ms: number) {
      return new Promise<void>((r) => setTimeout(r, ms));
    }
  }, [tick, room, visible]);

  return (
    <div
      ref={hostRef}
      className={className ?? "relative w-40 h-40 rounded overflow-hidden border border-white/10 bg-black"}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
