// components/Room/VideoGrid.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { IAgoraRTCClient, ILocalVideoTrack, IRemoteVideoTrack, IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";

type VideoTrack = {
  type: "local" | "remote";
  track: ILocalVideoTrack | IRemoteVideoTrack;
  userId: string;
};

type Props = {
  client: IAgoraRTCClient | null;
  className?: string;
};

export default function VideoGrid({ client, className }: Props) {
  const [tracks, setTracks] = useState<VideoTrack[]>([]);
  const videoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Handle local and remote tracks
  useEffect(() => {
    if (!client) return;

    const addLocalTrack = async () => {
      const localTrack = client.localTracks?.find(t => t.trackMediaType === "video") as ILocalVideoTrack | undefined;
      if (localTrack) {
        setTracks(prev => [...prev.filter(t => t.type !== "local"), { type: "local", track: localTrack, userId: "local" }]);
      }
    };

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: "video" | "audio") => {
      await client.subscribe(user, mediaType);
      if (mediaType === "video" && user.videoTrack) {
        setTracks(prev => [...prev, { type: "remote", track: user.videoTrack, userId: user.uid.toString() }]);
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      setTracks(prev => prev.filter(t => t.userId !== user.uid.toString()));
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    void addLocalTrack();

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
    };
  }, [client]);

  // Play video tracks
  useEffect(() => {
    tracks.forEach(({ track, userId }) => {
      const videoElement = videoRefs.current.get(userId);
      if (videoElement && track) {
        track.play(videoElement);
      }
    });
  }, [tracks]);

  // Dynamic grid columns
  const gridCols = tracks.length === 1 ? "grid-cols-1" : tracks.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className={`grid gap-3 ${gridCols}`}>
        {tracks.map(t => (
          <div
            key={t.userId}
            ref={el => {
              if (el) videoRefs.current.set(t.userId, el);
              else videoRefs.current.delete(t.userId);
            }}
            className="relative aspect-video bg-black rounded-lg overflow-hidden"
          >
            {t.type === "local" ? (
              <span className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                You (Local)
              </span>
            ) : (
              <span className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
                {t.userId}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}