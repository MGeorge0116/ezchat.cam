"use client";

import * as React from "react";

export interface MediaDeviceBarProps {
  selectedCameraId?: string | null;
  selectedMicrophoneId?: string | null;
  onSelectCamera?: (deviceId: string) => void;
  onSelectMicrophone?: (deviceId: string) => void;
  className?: string;
}

type DeviceInfo = { deviceId: string; label: string };

export default function MediaDeviceBar({
  selectedCameraId = null,
  selectedMicrophoneId = null,
  onSelectCamera,
  onSelectMicrophone,
  className,
}: MediaDeviceBarProps) {
  const [cams, setCams] = React.useState<DeviceInfo[]>([]);
  const [mics, setMics] = React.useState<DeviceInfo[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        // Some browsers hide labels until permission was granted at least once
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!active) return;

        const cameras: DeviceInfo[] = devices
          .filter((d) => d.kind === "videoinput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label || "Camera" }));

        const microphones: DeviceInfo[] = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone" }));

        setCams(cameras);
        setMics(microphones);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const handleCameraChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSelectCamera?.(e.currentTarget.value);
    },
    [onSelectCamera]
  );

  const handleMicrophoneChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSelectMicrophone?.(e.currentTarget.value);
    },
    [onSelectMicrophone]
  );

  return (
    <div
      className={`flex w-full items-center justify-end gap-3 px-2 py-2 ${className ?? ""}`}
      aria-label="Device selectors"
    >
      <label className="flex items-center gap-2 text-sm">
        <span className="opacity-80">Camera</span>
        <select
          value={selectedCameraId ?? ""}
          onChange={handleCameraChange}
          className="min-w-40 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
          disabled={loading || cams.length === 0}
        >
          <option value="" disabled>
            {loading ? "Loading…" : cams.length ? "Select camera" : "No cameras"}
          </option>
          {cams.map((c) => (
            <option key={c.deviceId} value={c.deviceId}>
              {c.label || "Camera"}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="opacity-80">Microphone</span>
        <select
          value={selectedMicrophoneId ?? ""}
          onChange={handleMicrophoneChange}
          className="min-w-40 rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-sm"
          disabled={loading || mics.length === 0}
        >
          <option value="" disabled>
            {loading ? "Loading…" : mics.length ? "Select mic" : "No microphones"}
          </option>
          {mics.map((m) => (
            <option key={m.deviceId} value={m.deviceId}>
              {m.label || "Microphone"}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
