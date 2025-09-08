"use client";
import { useEffect, useState } from "react";
import { useBroadcastActions, useBroadcastState } from "./hooks";

type Dev = { deviceId: string; label: string };

export default function DeviceSelectors({ room }: { room: string }) {
  const { isLive, selectedMicId, selectedCamId } = useBroadcastState(room);
  const { setMicDevice, setCamDevice } = useBroadcastActions(room);
  const [mics, setMics] = useState<Dev[]>([]);
  const [cams, setCams] = useState<Dev[]>([]);

  async function refresh() {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setMics(list.filter(d => d.kind === "audioinput").map(d => ({ deviceId: d.deviceId, label: d.label || "Microphone" })));
      setCams(list.filter(d => d.kind === "videoinput").map(d => ({ deviceId: d.deviceId, label: d.label || "Camera" })));
    } catch {}
  }

  useEffect(() => {
    if (!isLive) return;
    refresh();
    const onChange = () => refresh();
    // @ts-ignore
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange);
    return () => {
      // @ts-ignore
      navigator.mediaDevices?.removeEventListener?.("devicechange", onChange);
    };
  }, [isLive]);

  if (!isLive) return null;

  return (
    <div className="w-full -mt-1 mb-2 flex flex-wrap items-center justify-center gap-3">
      <label className="flex items-center gap-2 text-xs">
        <span className="opacity-70">Camera</span>
        <select value={selectedCamId ?? ""} onChange={(e) => setCamDevice(e.target.value)}
                className="bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1 text-sm">
          {cams.length === 0 && <option value="">No cameras</option>}
          {cams.map((c) => <option key={c.deviceId} value={c.deviceId}>{c.label}</option>)}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs">
        <span className="opacity-70">Microphone</span>
        <select value={selectedMicId ?? ""} onChange={(e) => setMicDevice(e.target.value)}
                className="bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1 text-sm">
          {mics.length === 0 && <option value="">No microphones</option>}
          {mics.map((m) => <option key={m.deviceId} value={m.deviceId}>{m.label}</option>)}
        </select>
      </label>
    </div>
  );
}
