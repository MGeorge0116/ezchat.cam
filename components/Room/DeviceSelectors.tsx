// components/room/DeviceSelectors.tsx
"use client";

import { useEffect, useState } from "react";
import { useBroadcastActions, useBroadcastState } from "./hooks";

type Props = { room: string };
type Dev = { deviceId: string; label: string };

export default function DeviceSelectors({ room }: Props) {
  const { isLive, selectedMicId, selectedCamId } = useBroadcastState(room);
  const { setMicDevice, setCamDevice } = useBroadcastActions(room);

  const [mics, setMics] = useState<Dev[]>([]);
  const [cams, setCams] = useState<Dev[]>([]);

  // enumerate devices (labels appear after permission; when live -> OK)
  async function refresh() {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setMics(
        list
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone" }))
      );
      setCams(
        list
          .filter((d) => d.kind === "videoinput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label || "Camera" }))
      );
    } catch {
      /* ignore */
    }
  }

  // Only refresh when live (keeps hook order stable; effect no-ops when not live)
  useEffect(() => {
    if (!isLive) return;
    refresh();
    const onChange = () => refresh();
    // @ts-ignore - older TS lib types
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange);
    return () => {
      // @ts-ignore
      navigator.mediaDevices?.removeEventListener?.("devicechange", onChange);
    };
  }, [isLive]);

  // NOTE: no conditional hooks. These are plain values (no useMemo).
  const micValue = selectedMicId ?? "";
  const camValue = selectedCamId ?? "";

  // Render nothing when not live
  if (!isLive) return null;

  return (
    <div className="w-full -mt-1 mb-2 flex flex-wrap items-center justify-center gap-3">
      <label className="flex items-center gap-2 text-xs">
        <span className="opacity-70">Camera</span>
        <select
          value={camValue}
          onChange={(e) => setCamDevice(e.target.value)}
          className="bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1 text-sm"
        >
          {cams.length === 0 && <option value="">No cameras</option>}
          {cams.map((c) => (
            <option key={c.deviceId} value={c.deviceId}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-xs">
        <span className="opacity-70">Microphone</span>
        <select
          value={micValue}
          onChange={(e) => setMicDevice(e.target.value)}
          className="bg-white/10 hover:bg-white/20 rounded-lg px-2 py-1 text-sm"
        >
          {mics.length === 0 && <option value="">No microphones</option>}
          {mics.map((m) => (
            <option key={m.deviceId} value={m.deviceId}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
