"use client";

import { useEffect, useState } from "react";

type MediaOption = { id: string; label: string };

const PERM_KEY = "ezcam_perm_asked_v1"; // only ask once per browser storage

export default function DeviceSelectors({ className }: { className?: string }) {
  const [cams, setCams] = useState<MediaOption[]>([]);
  const [mics, setMics] = useState<MediaOption[]>([]);
  const [cameraId, setCameraId] = useState<string | undefined>();
  const [micId, setMicId] = useState<string | undefined>();

  const enumerate = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();

    const camOpts: MediaOption[] = devices
      .filter((d) => d.kind === "videoinput")
      .map((d, i) => ({ id: d.deviceId || `default-camera-${i}`, label: d.label || `Camera ${i + 1}` }));

    const micOpts: MediaOption[] = devices
      .filter((d) => d.kind === "audioinput")
      .map((d, i) => ({ id: d.deviceId || `default-mic-${i}`, label: d.label || `Microphone ${i + 1}` }));

    setCams(camOpts);
    setMics(micOpts);

    if (!cameraId && camOpts.length) setCameraId(camOpts[0].id);
    if (!micId && micOpts.length) setMicId(micOpts[0].id);
  };

  useEffect(() => {
    const primeOnce = async () => {
      if (localStorage.getItem(PERM_KEY)) return;
      try {
        const tmp = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        tmp.getTracks().forEach((t) => t.stop());
        localStorage.setItem(PERM_KEY, "1");
      } catch {
        localStorage.setItem(PERM_KEY, "1");
      }
    };

    (async () => {
      await primeOnce();
      await enumerate();
    })();

    const onChange = () => enumerate().catch(() => {});
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("devices:selected", { detail: { cameraId, micId } }));
  }, [cameraId, micId]);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <label className="sr-only" htmlFor="cameraSelect">Camera</label>
      <select
        id="cameraSelect"
        value={cameraId}
        onChange={(e) => setCameraId(e.target.value)}
        className="h-9 min-w-[12rem] max-w-[24rem] truncate rounded-md bg-white/5 border border-white/10 px-2 text-sm outline-none focus:ring-2 focus:ring-white/20 dark:bg-white/10"
        title={cams.find((c) => c.id === cameraId)?.label || "Select camera"}
      >
        {cams.map((c) => (
          <option key={c.id} value={c.id} title={c.label}>{c.label}</option>
        ))}
      </select>

      <label className="sr-only" htmlFor="micSelect">Microphone</label>
      <select
        id="micSelect"
        value={micId}
        onChange={(e) => setMicId(e.target.value)}
        className="h-9 min-w-[12rem] max-w-[24rem] truncate rounded-md bg-white/5 border border-white/10 px-2 text-sm outline-none focus:ring-2 focus:ring-white/20 dark:bg-white/10"
        title={mics.find((m) => m.id === micId)?.label || "Select microphone"}
      >
        {mics.map((m) => (
          <option key={m.id} value={m.id} title={m.label}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}
