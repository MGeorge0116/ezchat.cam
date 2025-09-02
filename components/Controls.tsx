// components/Controls.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ensureClients, getRtcClient, reportDirectory } from "../lib/agora"; // if reportDirectory is elsewhere, keep its original import
import { reportDirectory as sendDirectory } from "../lib/reportDirectory";

export default function Controls({
  channelName,
  uid,
  description = "",
  onCameraChange,
}: {
  channelName: string;
  uid: string;
  description?: string;
  onCameraChange?: (cameraOn: boolean, videoEl?: HTMLVideoElement) => void;
}) {
  const [ready, setReady] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await ensureClients();
        if (alive) setReady(true);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Hidden local video for snapshots
  useEffect(() => {
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.style.position = "absolute";
    v.style.left = "-99999px";
    v.style.width = "1px";
    v.style.height = "1px";
    document.body.appendChild(v);
    localVideoRef.current = v;
    return () => { try { v.pause(); } catch {}; v.remove(); localVideoRef.current = null; };
  }, []);

  const start = useCallback(async () => {
    if (!ready) return;
    const rtc = getRtcClient();

    const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
    const [micTrack, camTrack] = await Promise.all([
      AgoraRTC.createMicrophoneAudioTrack(),
      AgoraRTC.createCameraVideoTrack(),
    ]);

    if (localVideoRef.current) {
      await camTrack.play(localVideoRef.current);
    }

    await rtc.publish([micTrack, camTrack]);
    (rtc as any).localTracks = [micTrack, camTrack];
    setPublishing(true);
    onCameraChange?.(true, localVideoRef.current || undefined);

    await sendDirectory(channelName, description, [
      { uid: String(uid), cameraOn: true, videoEl: localVideoRef.current || undefined },
    ]);
  }, [ready, channelName, description, uid, onCameraChange]);

  const stop = useCallback(async () => {
    if (!ready) return;
    const rtc = getRtcClient();

    const localTracks: any[] = (rtc as any).localTracks || [];
    for (const t of localTracks) {
      try { t.stop(); } catch {}
      try { t.close?.(); } catch {}
    }
    await rtc.unpublish();
    (rtc as any).localTracks = [];
    setPublishing(false);
    onCameraChange?.(false, undefined);

    await sendDirectory(channelName, description, [
      { uid: String(uid), cameraOn: false },
    ]);
  }, [ready, channelName, description, uid, onCameraChange]);

  return (
    <div className="controls">
      {!publishing ? (
        <button className="button" onClick={start} disabled={!ready}>
          {ready ? "Start" : "Starting…"}
        </button>
      ) : (
        <button className="button" onClick={stop}>
          Stop
        </button>
      )}
    </div>
  );
}
