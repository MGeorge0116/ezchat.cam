// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\components\RoomCard.tsx
"use client";
import { useEffect, useMemo, useState } from "react";

export type ActiveRoom = {
  id?: string | number;
  name: string;
  participants?: number;
  streams?: number;
  activeAt?: string;
  thumbUrl?: string | null; // optional external/custom URL
};

export default function RoomCard({
  room,
  onJoin,
}: {
  room: ActiveRoom;
  onJoin: (name: string) => void;
}) {
  const {
    name,
    participants = 0,
    streams = 0,
    activeAt,
    thumbUrl,
  } = room;

  // Cache-buster bucket: changes every 5 minutes
  const [bucket, setBucket] = useState<number>(() =>
    Math.floor(Date.now() / (5 * 60 * 1000))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setBucket(Math.floor(Date.now() / (5 * 60 * 1000)));
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // If no custom thumbUrl provided, derive from our API
  const derivedThumb = useMemo(() => {
    return `/api/rooms/${encodeURIComponent(name)}/thumb?cb=${bucket}`;
  }, [name, bucket]);

  const displayThumb = thumbUrl || derivedThumb;

  return (
    <div className="card" style={{ overflow: "hidden", padding: 0 }}>
      <div
        style={{
          height: 160,
          background: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title={`${name} preview`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayThumb}
          alt={`${name} thumbnail`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 650, marginBottom: 2 }}>{name}</div>
        <div style={{ display: "flex", gap: 12, opacity: 0.8, fontSize: 13 }}>
          <span title="Participants">👥 {participants}</span>
          <span title="Streams">🎥 {streams}</span>
        </div>
        <div style={{ opacity: 0.7, fontSize: 12, marginTop: 6 }}>
          {activeAt ? `Active ${activeAt}` : "Active now"}
        </div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button className="button" onClick={() => onJoin(name)}>
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
