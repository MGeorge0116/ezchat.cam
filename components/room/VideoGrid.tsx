"use client";

import { useEffect, useRef, useState } from "react";
import { useBroadcastState } from "./hooks";

export default function VideoGrid({ room }: { room: string }) {
  const { isLive, stream } = useBroadcastState(room);
  const localRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    el.muted = true;
    el.playsInline = true;
    if (stream) {
      el.srcObject = stream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [stream]);

  return (
    <div className="h-full border border-white/10 rounded-2xl bg-white/5 p-3">
      <div className="h-full w-full rounded-xl bg-black/30 flex items-center justify-center relative overflow-hidden">
        {isLive && mounted ? (
          <video ref={localRef} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/60 text-sm">Click Start Broadcasting to go live.</div>
        )}
      </div>
    </div>
  );
}
