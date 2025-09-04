// components/RoomSnapshot.tsx
"use client";

import React, { useEffect, useRef } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
} from "agora-rtc-sdk-ng";
import { ensureClients, getRtcClient } from "@/lib/agora";
import { pushMemberSnapshot } from "@/lib/reportDirectory";

type Props = {
  channelName: string;
  intervalMs?: number; // how often to capture a snapshot for the active remote user(s)
};

/**
 * Lightweight utility that listens for remote user video,
 * attaches it to a hidden <video>, and periodically pushes
 * a snapshot to the directory for thumbnails.
 */
export default function RoomSnapshot({ channelName, intervalMs = 60_000 }: Props) {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const videoHostRef = useRef<HTMLDivElement | null>(null);
  const timers = useRef<Map<string, number>>(new Map()); // uid -> intervalId
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      await ensureClients();
      if (!alive) return;

      const client = getRtcClient();
      clientRef.current = client;

      const attachVideoAndStartSnapshots = (user: IAgoraRTCRemoteUser) => {
        // Create (or reuse) a wrapper for each remote user
        const wrap = document.createElement("div");
        wrap.style.position = "absolute";
        wrap.style.left = "-99999px";
        wrap.style.width = "320px";
        wrap.style.height = "180px";

        const host = document.createElement("div");
        host.style.width = "100%";
        host.style.height = "100%";
        wrap.appendChild(host);

        videoHostRef.current = host;
        containerRef.current?.appendChild(wrap);

        user.videoTrack?.play(host);

        // Find the <video> element Agora injected
        const videoEl = wrap.querySelector("video") as HTMLVideoElement | null;
        if (!videoEl) return;

        // Initial snapshot
        void pushMemberSnapshot(channelName, String(user.uid), videoEl);

        // Periodic snapshots
        const id = window.setInterval(() => {
          void pushMemberSnapshot(channelName, String(user.uid), videoEl);
        }, intervalMs);
        timers.current.set(String(user.uid), id);
      };

      const clearUser = (user: IAgoraRTCRemoteUser) => {
        const uid = String(user.uid);

        // stop timer
        const t = timers.current.get(uid);
        if (t) {
          clearInterval(t);
          timers.current.delete(uid);
        }

        // remove injected wrapper (if still present)
        if (containerRef.current) {
          // remove all children we created (safe cleanup)
          while (containerRef.current.firstChild) {
            try {
              containerRef.current.removeChild(containerRef.current.firstChild);
            } catch {}
          }
        }
      };

      const onUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          attachVideoAndStartSnapshots(user);
        } else if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      };

      const onUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
        if (mediaType === "video") {
          clearUser(user);
        }
      };

      const onUserLeft = (user: IAgoraRTCRemoteUser) => clearUser(user);

      client.on("user-published", onUserPublished);
      client.on("user-unpublished", onUserUnpublished);
      client.on("user-left", onUserLeft);

      return () => {
        client.off("user-published", onUserPublished);
        client.off("user-unpublished", onUserUnpublished);
        client.off("user-left", onUserLeft);
      };
    })();

    return () => {
      alive = false;
      // clear timers
      timers.current.forEach((id) => clearInterval(id));
      timers.current.clear();
      // remove wrappers
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          try {
            containerRef.current.removeChild(containerRef.current.firstChild);
          } catch {}
        }
      }
    };
  }, [channelName, intervalMs]);

  // Hidden container where we mount invisible remote <video> elements
  return <div style={{ position: "absolute", left: -99999 }} ref={containerRef} />;
}
