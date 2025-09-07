"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  roomName: string;
  username?: string;
};

declare global {
  interface Window {
    __localStream?: MediaStream | null;
  }
}

export default function Controls({ roomName, username }: Props) {
  const [broadcasting, setBroadcasting] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [deafened, setDeafened] = useState(false);
  const savedVolumes = useRef<WeakMap<HTMLMediaElement, number>>(new WeakMap());

  // styles
  const btn =
    "inline-flex items-center rounded-xl border border-white/10 px-3 py-1.5 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 transition-colors";
  const green = "bg-emerald-600 hover:bg-emerald-500 text-white";
  const red = "bg-rose-600 hover:bg-rose-500 text-white";
  const ghost = "bg-transparent hover:bg-white/10 text-white/90";

  // ---------- Deafen / Undeafen ----------
  const applyDeafen = useCallback((on: boolean) => {
    document.querySelectorAll<HTMLMediaElement>("audio,video").forEach((el) => {
      if (on) {
        if (!savedVolumes.current.has(el)) savedVolumes.current.set(el, el.volume ?? 1);
        el.muted = true;
        el.volume = 0;
      } else {
        el.muted = false;
        el.volume = savedVolumes.current.get(el) ?? 1;
      }
    });
  }, []);
  const toggleDeafen = () => setDeafened((d) => (applyDeafen(!d), !d));

  // ---------- Local media helpers ----------
  const openLocal = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getAudioTracks().forEach((t) => (t.enabled = !micMuted));
    stream.getVideoTracks().forEach((t) => (t.enabled = cameraOn));
    window.__localStream = stream;

    window.dispatchEvent(
      new CustomEvent("room:local-stream", { detail: { stream, roomName, username } })
    );
  };

  const closeLocal = () => {
    const s = window.__localStream;
    if (s) s.getTracks().forEach((t) => t.stop());
    window.__localStream = null;

    window.dispatchEvent(
      new CustomEvent("room:local-stream-stopped", { detail: { roomName, username } })
    );
  };

  // ---------- Actions ----------
  const start = async () => {
    await openLocal();
    setBroadcasting(true); // after stream is ready, flip UI -> shows Stop (red)
  };

  const stop = () => {
    closeLocal();
    setBroadcasting(false); // back to Start (green)
  };

  const toggleMic = () => {
    const next = !micMuted;
    setMicMuted(next);
    window.__localStream?.getAudioTracks().forEach((t) => (t.enabled = !next));
  };

  const toggleCamera = () => {
    const next = !cameraOn;
    setCameraOn(next);
    window.__localStream?.getVideoTracks().forEach((t) => (t.enabled = next));
    if (!window.__localStream && broadcasting && next) void openLocal();
  };

  useEffect(() => {
    applyDeafen(deafened);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* NOT broadcasting -> Start (green) + Deafen */}
      {!broadcasting && (
        <>
          <button
            className={`${btn} ${green}`}
            onClick={start}
            aria-label="Start Broadcasting"
            data-testid="start-btn"
          >
            Start Broadcasting
          </button>
          <button
            className={`${btn} ${deafened ? red : ghost}`}
            onClick={toggleDeafen}
            aria-pressed={deafened}
          >
            {deafened ? "Undeafen" : "Deafen"}
          </button>
        </>
      )}

      {/* Broadcasting -> Stop (red) + Camera + Mic + Deafen */}
      {broadcasting && (
        <>
          {/* NOTE: this is always STOP when broadcasting */}
          <button
            className={`${btn} ${red}`}
            onClick={stop}
            aria-label="Stop Broadcasting"
            data-testid="stop-btn"
          >
            Stop Broadcasting
          </button>

          <button
            className={`${btn} ${cameraOn ? red : green}`}
            onClick={toggleCamera}
            aria-pressed={!cameraOn}
          >
            {cameraOn ? "Camera Off" : "Camera On"}
          </button>

          <button
            className={`${btn} ${micMuted ? green : red}`}
            onClick={toggleMic}
            aria-pressed={micMuted}
          >
            {micMuted ? "Unmute Microphone" : "Mute Microphone"}
          </button>

          <button
            className={`${btn} ${deafened ? red : ghost}`}
            onClick={toggleDeafen}
            aria-pressed={deafened}
          >
            {deafened ? "Undeafen" : "Deafen"}
          </button>
        </>
      )}
    </div>
  );
}
