// components/VideoGrid.tsx
"use client";

import { useEffect, useRef } from "react";
import { ensureClients, getRtcClient } from "../lib/agora";
import { pushMemberSnapshot } from "../lib/reportDirectory";

export default function VideoGrid({ channelName }: { channelName: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const snapshotTimers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await ensureClients(); // make sure rtc/rtm are ready
        if (!alive) return;

        const rtc = getRtcClient();

        const onUserPublished = async (user: any, mediaType: any) => {
          await rtc.subscribe(user, mediaType);
          if (mediaType === "video") {
            const wrap = document.createElement("div");
            wrap.style.width = "100%";
            wrap.style.height = "240px";
            wrap.style.position = "relative";
            const videoHost = document.createElement("div");
            videoHost.style.width = "100%";
            videoHost.style.height = "100%";
            wrap.appendChild(videoHost);

            containerRef.current?.appendChild(wrap);
            user.videoTrack?.play(videoHost);

            const videoEl = wrap.querySelector("video") as HTMLVideoElement | null;
            if (videoEl) {
              pushMemberSnapshot(channelName, String(user.uid), videoEl).catch(() => {});
              const id = window.setInterval(() => {
                pushMemberSnapshot(channelName, String(user.uid), videoEl).catch(() => {});
              }, 60_000);
              snapshotTimers.current.set(String(user.uid), id);
            }
          }
          if (mediaType === "audio") user.audioTrack?.play();
        };

        const onUserUnpublished = (user: any, mediaType: any) => {
          if (mediaType === "video") {
            const id = snapshotTimers.current.get(String(user.uid));
            if (id) { clearInterval(id); snapshotTimers.current.delete(String(user.uid)); }
          }
        };

        rtc.on("user-published", onUserPublished);
        rtc.on("user-unpublished", onUserUnpublished);

        // Cleanup listeners on unmount
        return () => {
          rtc.off("user-published", onUserPublished);
          rtc.off("user-unpublished", onUserUnpublished);
        };
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      alive = false;
      snapshotTimers.current.forEach((id) => clearInterval(id));
      snapshotTimers.current.clear();
    };
  }, [channelName]);

  return <div ref={containerRef} />;
}
