"use client";

import * as React from "react";
import MediaDeviceBar from "@/components/MediaDeviceBar";
import BroadcastControls from "@/components/room/BroadcastControls";

export interface RoomCenterPanelProps {
  room: string;
  className?: string;
}

export default function RoomCenterPanel({ room, className }: RoomCenterPanelProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [isBroadcasting, setIsBroadcasting] = React.useState(false);
  const [micMuted, setMicMuted] = React.useState(false);
  const [deafened, setDeafened] = React.useState(false);
  const [cameraId, setCameraId] = React.useState<string | null>(null);
  const [micId, setMicId] = React.useState<string | null>(null);
  const mediaStreamRef = React.useRef<MediaStream | null>(null);

  const start = React.useCallback(async () => {
    // Acquire tracks using chosen devices if provided
    const constraints: MediaStreamConstraints = {
      video: cameraId ? { deviceId: { exact: cameraId } } : true,
      audio: micId ? { deviceId: { exact: micId } } : true,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    mediaStreamRef.current = stream;
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.srcObject = stream;
      await videoEl.play();
    }
    setIsBroadcasting(true);
  }, [cameraId, micId]);

  const stop = React.useCallback(() => {
    const stream = mediaStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.srcObject = null;
    }
    setIsBroadcasting(false);
  }, []);

  const toggleMic = React.useCallback(() => {
    const stream = mediaStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMicMuted((v) => !v);
  }, []);

  const toggleDeafen = React.useCallback(() => {
    // Deafen = mute *page* media (local + remote). Here we only mute the local preview element.
    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.muted = !videoEl.muted;
    }
    setDeafened((v) => !v);
  }, []);

  React.useEffect(() => {
    return () => {
      // cleanup on unmount
      const stream = mediaStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className={`flex h-full flex-col ${className ?? ""}`}>
      {/* Device selectors belong ABOVE the broadcast panel */}
      <MediaDeviceBar
        selectedCameraId={cameraId}
        selectedMicrophoneId={micId}
        onSelectCamera={setCameraId}
        onSelectMicrophone={setMicId}
        className="border-b border-neutral-800"
      />

      {/* Video stage */}
      <div className="flex flex-1 items-center justify-center">
        <video
          ref={videoRef}
          className="max-h-[62vh] max-w-[92%] rounded-xl border border-neutral-700 object-contain"
          muted // local preview muted to avoid echo
          playsInline
          autoPlay
        />
      </div>

      {/* Controls belong BELOW the video */}
      <BroadcastControls
        isBroadcasting={isBroadcasting}
        onStart={start}
        onStop={stop}
        micMuted={micMuted}
        onToggleMic={toggleMic}
        deafened={deafened}
        onToggleDeafen={toggleDeafen}
        className="mt-2"
      />
    </div>
  );
}
