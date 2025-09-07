// File: components/room/VideoTile.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import type { Participant } from './VideoGrid';

export default function VideoTile({ participant }: { participant: Participant }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // attach stream if present
    if (participant.stream && v.srcObject !== participant.stream) {
      v.srcObject = participant.stream;
    }

    // local tile muted to avoid echo
    v.muted = participant.id === 'local';
    v.playsInline = true;

    const play = async () => {
      try { await v.play(); } catch {}
    };
    play();

    return () => {
      try {
        v.pause();
        v.srcObject = null; // do not stop tracks here
      } catch {}
    };
  }, [participant.stream, participant.id]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 aspect-video flex items-center justify-center">
      {participant.stream && participant.camOn ? (
        <video ref={ref} className="w-full h-full object-cover" autoPlay playsInline />
      ) : (
        <div className="w-full h-full bg-black/70 flex items-center justify-center">
          <span className="text-white/50 text-sm">Camera Off</span>
        </div>
      )}

      {/* Name badge (ALL CAPS) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 text-white font-extrabold tracking-wider uppercase">
        {participant.name}
      </div>

      {/* Mic status */}
      {!participant.micOn && (
        <div className="absolute top-2 right-2 rounded bg-red-600/80 text-white text-xs px-2 py-0.5">
          MIC OFF
        </div>
      )}
    </div>
  );
}
