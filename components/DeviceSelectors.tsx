"use client";

import { useEffect, useState } from "react";

type Device = { deviceId: string; label: string };

export default function DeviceSelectors() {
  const [cams, setCams] = useState<Device[]>([]);
  const [mics, setMics] = useState<Device[]>([]);
  const [camId, setCamId] = useState("");
  const [micId, setMicId] = useState("");

  useEffect(() => {
    const refresh = async () => {
      try {
        const devs = await navigator.mediaDevices?.enumerateDevices?.();
        const camList = (devs || []).filter(d => d.kind === "videoinput").map(d => ({ deviceId: d.deviceId, label: d.label || "Camera" }));
        const micList = (devs || []).filter(d => d.kind === "audioinput").map(d => ({ deviceId: d.deviceId, label: d.label || "Microphone" }));
        setCams(camList);
        setMics(micList);
        if (!camId && camList[0]) setCamId(camList[0].deviceId);
        if (!micId && micList[0]) setMicId(micList[0].deviceId);
      } catch {}
    };
    refresh();
  }, [camId, micId]);

  useEffect(() => { if (camId) localStorage.setItem("preferredCamera", camId); }, [camId]);
  useEffect(() => { if (micId) localStorage.setItem("preferredMicrophone", micId); }, [micId]);

  return (
    <div className="flex items-center gap-2">
      <select
        value={camId}
        onChange={(e) => setCamId(e.target.value)}
        className="min-w-[12rem] rounded-xl border border-white/15 bg-transparent px-2 py-1"
        aria-label="Select camera"
      >
        {cams.map(c => <option key={c.deviceId} value={c.deviceId} className="bg-black text-white">{c.label}</option>)}
      </select>

      <select
        value={micId}
        onChange={(e) => setMicId(e.target.value)}
        className="min-w-[12rem] rounded-xl border border-white/15 bg-transparent px-2 py-1"
        aria-label="Select microphone"
      >
        {mics.map(m => <option key={m.deviceId} value={m.deviceId} className="bg-black text-white">{m.label}</option>)}
      </select>
    </div>
  );
}
