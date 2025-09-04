// components/MediaDeviceBar.tsx
"use client";

import React from "react";
import { getRtcClient } from "../lib/agora";

type MediaDeviceInfoLite = Pick<MediaDeviceInfo, "deviceId" | "kind" | "label">;

function isVideoInput(d: MediaDeviceInfo) {
  return d.kind === "videoinput";
}
function isAudioInput(d: MediaDeviceInfo) {
  return d.kind === "audioinput";
}

const LS_VIDEO = "prefVideoDeviceId";
const LS_AUDIO = "prefAudioDeviceId";

export default function MediaDeviceBar() {
  const [loading, setLoading] = React.useState(false);
  const [videos, setVideos] = React.useState<MediaDeviceInfoLite[]>([]);
  const [audios, setAudios] = React.useState<MediaDeviceInfoLite[]>([]);
  const [videoId, setVideoId] = React.useState<string | undefined>(
    () => (typeof window !== "undefined" ? localStorage.getItem(LS_VIDEO) || undefined : undefined)
  );
  const [audioId, setAudioId] = React.useState<string | undefined>(
    () => (typeof window !== "undefined" ? localStorage.getItem(LS_AUDIO) || undefined : undefined)
  );

  // Ask for permissions once so device labels are visible
  async function warmPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore - user may decline */
    }
  }

  const enumerate = React.useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    setLoading(true);
    try {
      await warmPermissions();
      const list = await navigator.mediaDevices.enumerateDevices();
      const v = list.filter(isVideoInput).map(({ deviceId, kind, label }) => ({ deviceId, kind, label }));
      const a = list.filter(isAudioInput).map(({ deviceId, kind, label }) => ({ deviceId, kind, label }));
      setVideos(v);
      setAudios(a);

      // default selections if none saved
      if (!videoId && v[0]?.deviceId) setVideoId(v[0].deviceId);
      if (!audioId && a[0]?.deviceId) setAudioId(a[0].deviceId);
    } finally {
      setLoading(false);
    }
  }, [videoId, audioId]);

  React.useEffect(() => {
    enumerate();
    const onChange = () => enumerate();
    navigator.mediaDevices?.addEventListener?.("devicechange", onChange);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", onChange);
  }, [enumerate]);

  // Switch running Agora tracks if publishing
  async function switchVideo(id: string) {
    try {
      const rtc: any = getRtcClient?.();
      const tracks: any[] = rtc?.localTracks || [];
      const cam = tracks.find((t) => t?.setDevice && t?.getTrack?.()?.kind === "video");
      if (cam) await cam.setDevice(id);
    } catch (e) {
      // no-op
      console.warn("video switch error", e);
    }
  }
  async function switchAudio(id: string) {
    try {
      const rtc: any = getRtcClient?.();
      const tracks: any[] = rtc?.localTracks || [];
      const mic = tracks.find((t) => t?.setDevice && t?.getTrack?.()?.kind === "audio");
      if (mic) await mic.setDevice(id);
    } catch (e) {
      console.warn("audio switch error", e);
    }
  }

  return (
    <div className="devicebar">
      <div className="picker">
        <label className="lbl">Camera</label>
        <select
          value={videoId || ""}
          onChange={async (e) => {
            const id = e.target.value || undefined;
            setVideoId(id);
            if (id) {
              localStorage.setItem(LS_VIDEO, id);
              await switchVideo(id);
            }
          }}
          disabled={loading || videos.length === 0}
        >
          {videos.length === 0 && <option value="">No cameras</option>}
          {videos.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="picker">
        <label className="lbl">Microphone</label>
        <select
          value={audioId || ""}
          onChange={async (e) => {
            const id = e.target.value || undefined;
            setAudioId(id);
            if (id) {
              localStorage.setItem(LS_AUDIO, id);
              await switchAudio(id);
            }
          }}
          disabled={loading || audios.length === 0}
        >
          {audios.length === 0 && <option value="">No microphones</option>}
          {audios.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>
              {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-small" onClick={enumerate} disabled={loading} title="Rescan devices">
        {loading ? "Scanning…" : "Refresh"}
      </button>

      <style jsx>{`
        .devicebar {
          position: sticky;
          top: 56px; /* just below your site header */
          z-index: 30;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding: 8px 10px;
          border-bottom: 1px solid var(--edge);
          background: var(--bg);
        }
        .picker {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--panel);
          border: 1px solid var(--edge);
          padding: 6px 8px;
          border-radius: 10px;
        }
        .lbl {
          font-size: 12px;
          font-weight: 700;
          opacity: 0.8;
        }
        select {
          background: var(--bg);
          color: var(--text);
          border: 1px solid var(--edge);
          border-radius: 8px;
          padding: 6px 8px;
          min-width: 200px;
          outline: none;
        }
        .btn {
          padding: 6px 10px;
          border-radius: 10px;
          font-weight: 700;
          border: 1px solid var(--btn-edge);
          background: var(--btn);
          color: var(--text);
          cursor: pointer;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>
    </div>
  );
}
