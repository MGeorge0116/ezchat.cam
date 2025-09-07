// components/room/BroadcastControls.tsx
"use client";

import { useEffect, useRef } from "react";
import {
  addLocalTile,
  removeLocalTile,
  updateLocalTileMute,
  useBroadcastActions,
  useBroadcastState,
} from "./hooks";

type Props = { room: string };

export default function BroadcastControls({ room }: Props) {
  const { isLive, micMuted, deafened } = useBroadcastState(room);
  const { start, stop, toggleMic, toggleDeafen } = useBroadcastActions(room);
  const starting = useRef(false);

  useEffect(() => {
    // Ensure page-wide media respects deafen
    const media = Array.from(document.querySelectorAll("video,audio")) as HTMLMediaElement[];
    media.forEach((m) => (m.muted = deafened || m.muted));
  }, [deafened]);

  return (
    <div className="w-full flex items-center justify-center gap-3">
      {!isLive ? (
        <>
          <button
            disabled={starting.current}
            onClick={async () => {
              if (starting.current) return;
              starting.current = true;
              try {
                const stream = await start();
                addLocalTile({ id: "local", label: currentUsername(), stream });
              } finally {
                starting.current = false;
              }
            }}
            className="px-4 py-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            Start Broadcasting
          </button>
          <button
            onClick={toggleDeafen}
            className={`px-4 py-2 rounded-2xl ${
              deafened ? "bg-red-600 hover:bg-red-700" : "bg-white/10 hover:bg-white/20"
            } text-white`}
            title="Deafen mutes all page audio"
          >
            {deafened ? "Undeafen" : "Deafen"}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              stop();
              removeLocalTile("local");
            }}
            className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            Stop Broadcasting
          </button>

          {/* Mic toggle only (camera toggle removed) */}
          <button
            onClick={() => {
              const nowMuted = toggleMic(); // returns the new micMuted state
              updateLocalTileMute("local", nowMuted);
            }}
            className={`px-4 py-2 rounded-2xl ${
              micMuted ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            } text-white font-medium`}
          >
            {micMuted ? "Mute Microphone" : "Unmute Microphone"}
          </button>

          <button
            onClick={toggleDeafen}
            className={`px-4 py-2 rounded-2xl ${
              deafened ? "bg-red-600 hover:bg-red-700" : "bg-white/10 hover:bg-white/20"
            } text-white`}
            title="Deafen mutes all page audio"
          >
            {deafened ? "Undeafen" : "Deafen"}
          </button>
        </>
      )}
    </div>
  );
}

function currentUsername() {
  return (
    localStorage.getItem("auth:username") ||
    localStorage.getItem("profile:username") ||
    localStorage.getItem("ui:username") ||
    "ME"
  ).toUpperCase();
}
