"use client";

import { useEffect, useRef, useState } from "react";
import { useBroadcastActions, useBroadcastState } from "./hooks";

export default function BroadcastControls({ room }: { room: string }) {
  const { isLive, micMuted } = useBroadcastState(room);
  const { start, stop, toggleMic, toggleDeafen } = useBroadcastActions(room);
  const starting = useRef(false);
  const [label, setLabel] = useState("Start Broadcasting");

  useEffect(() => {
    setLabel(isLive ? "Stop Broadcasting" : "Start Broadcasting");
  }, [isLive]);

  async function handleStartStop() {
    if (starting.current) return;
    starting.current = true;
    try {
      if (isLive) stop();
      else await start();
    } catch {}
    starting.current = false;
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={handleStartStop}
        className={`px-4 py-2 rounded-xl text-sm font-semibold ${isLive ? "bg-red-600" : "bg-green-600"}`}
      >
        {label}
      </button>

      <button
        onClick={() => toggleMic()}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600"
      >
        {micMuted ? "Unmute Microphone" : "Mute Microphone"}
      </button>

      <button
        onClick={() => toggleDeafen()}
        className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10"
      >
        Deafen
      </button>
    </div>
  );
}
