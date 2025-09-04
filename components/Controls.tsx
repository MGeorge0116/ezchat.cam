// components/Controls.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { IAgoraRTC, IAgoraRTCClient } from "agora-rtc-sdk-ng"; // Assuming you're using Agora RTC SDK

// ✅ Correct imports — DO NOT import reportDirectory from "../lib/agora"
import { ensureClients, getRtcClient } from "../lib/agora";
import { reportDirectory } from "../lib/reportDirectory";

type DeviceInfo = { deviceId: string; label: string };

type Props = {
  roomName: string; // RTC channel
  username: string; // ALL CAPS elsewhere
  className?: string;
  onStarted?: () => void;
  onStopped?: () => void;
};

export default function Controls({
  roomName,
  username,
  className,
  onStarted,
  onStopped,
}: Props) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);

  const [mics, setMics] = useState<DeviceInfo[]>([]);
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [selectedCam, setSelectedCam] = useState<string>("");

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const joiningRef = useRef(false);

  // ---- devices -------------------------------------------------------------
  const listDevices = useCallback(async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();

    const micList: DeviceInfo[] = [];
    const camList: DeviceInfo[] = [];

    for (const d of devices) {
      if (d.kind === "audioinput") micList.push({ deviceId: d.deviceId, label: d.label || "Microphone" });
      if (d.kind === "videoinput") camList.push({ deviceId: d.deviceId, label: d.label || "Camera" });
    }

    setMics(micList);
    setCameras(camList);

    if (!selectedMic && micList[0]?.deviceId) setSelectedMic(micList[0].deviceId);
    if (!selectedCam && camList[0]?.deviceId) setSelectedCam(camList[0].deviceId);
  }, [selectedMic, selectedCam]);

  useEffect(() => {
    let t: number | undefined;
    const tick = async () => {
      await listDevices();
      if (isBroadcasting) t = window.setTimeout(tick, 10_000);
    };
    tick();
    return () => {
      if (t !== undefined) {
        window.clearTimeout(t);
      }
    };
  }, [isBroadcasting, listDevices]);

  // ---- start / stop --------------------------------------------------------
  const startBroadcast = useCallback(async () => {
    if (joiningRef.current || isBroadcasting) return;
    joiningRef.current = true;
    try {
      await ensureClients();
      const rtc = await getRtcClient();
      clientRef.current = rtc;

      await rtc?.join?.(roomName, username);

      if (selectedMic) await rtc?.setMicrophone?.(selectedMic);
      if (selectedCam) await rtc?.setCamera?.(selectedCam);

      if (micMuted) await rtc?.muteMic?.();
      else await rtc?.unmuteMic?.();
      if (cameraOn) await rtc?.enableCamera?.();
      else await rtc?.disableCamera?.();

      setIsBroadcasting(true);
      onStarted?.();

      try {
        await reportDirectory?.({
          action: "start",
          room: roomName,
          username,
          cameraOn,
          micMuted,
        });
      } catch {}
    } finally {
      joiningRef.current = false;
    }
  }, [roomName, username, selectedMic, selectedCam, micMuted, cameraOn, onStarted, isBroadcasting]);

  const stopBroadcast = useCallback(async () => {
    const rtc = clientRef.current;
    try {
      await rtc?.leave?.();
    } finally {
      clientRef.current = null;
      setIsBroadcasting(false);
      onStopped?.();
      try {
        await reportDirectory?.({ action: "stop", room: roomName, username });
      } catch {}
    }
  }, [roomName, username, onStopped]);

  // ---- toggles -------------------------------------------------------------
  const toggleMic = useCallback(async () => {
    const next = !micMuted;
    setMicMuted(next);
    const rtc = clientRef.current;
    try {
      if (next) await rtc?.muteMic?.();
      else await rtc?.unmuteMic?.();
    } catch {}
  }, [micMuted]);

  const toggleCamera = useCallback(async () => {
    const next = !cameraOn;
    setCameraOn(next);
    const rtc = clientRef.current;
    try {
      if (next) await rtc?.enableCamera?.();
      else await rtc?.disableCamera?.();
    } catch {}
  }, [cameraOn]);

  // ---- device selection ----------------------------------------------------
  const onChangeMic = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedMic(id);
    const rtc = clientRef.current;
    try {
      await rtc?.setMicrophone?.(id);
    } catch {}
  }, []);

  const onChangeCam = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCam(id);
    const rtc = clientRef.current;
    try {
      await rtc?.setCamera?.(id);
    } catch {}
  }, []);

  // ---- UI ------------------------------------------------------------------
  const canStart = useMemo(() => !isBroadcasting && !joiningRef.current, [isBroadcasting]);
  const canStop = useMemo(() => isBroadcasting && !joiningRef.current, [isBroadcasting]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {!isBroadcasting ? (
          <button
            type="button"
            onClick={startBroadcast}
            disabled={!canStart}
            className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/20 hover:border-white/40 active:translate-y-[0.5px]"
            aria-label="Start Broadcasting"
          >
            Start Broadcasting
          </button>
        ) : (
          <button
            type="button"
            onClick={stopBroadcast}
            disabled={!canStop}
            className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/20 hover:border-white/40 active:translate-y-[0.5px]"
            aria-label="Stop Broadcasting"
          >
            Stop Broadcasting
          </button>
        )}

        <button
          type="button"
          onClick={toggleMic}
          disabled={!isBroadcasting}
          className="rounded-2xl px-4 py-2 text-sm font-medium border border-white/20 hover:border-white/40"
          aria-label={micMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {micMuted ? "Unmute Microphone" : "Mute Microphone"}
        </button>

        <button
          type="button"
          onClick={toggleCamera}
          disabled={!isBroadcasting}
          className="rounded-2xl px-4 py-2 text-sm font-medium border border-white/20 hover:border-white/40"
          aria-label={cameraOn ? "Camera Off" : "Camera On"}
        >
          {cameraOn ? "Camera Off" : "Camera On"}
        </button>
      </div>

      {isBroadcasting && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <label className="opacity-70">Mic:</label>
          <select
            value={selectedMic}
            onChange={onChangeMic}
            className="max-w-[14rem] truncate rounded-xl border border-white/15 bg-transparent px-2 py-1"
            aria-label="Select Microphone"
          >
            {mics.map((m) => (
              <option key={m.deviceId} value={m.deviceId} className="bg-black text-white">
                {m.label}
              </option>
            ))}
          </select>

          <label className="ml-3 opacity-70">Camera:</label>
          <select
            value={selectedCam}
            onChange={onChangeCam}
            className="max-w-[14rem] truncate rounded-xl border border-white/15 bg-transparent px-2 py-1"
            aria-label="Select Camera"
          >
            {cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId} className="bg-black text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}