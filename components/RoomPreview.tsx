// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\components\RoomCard.tsx
"use client";

export type ActiveRoom = {
  id?: string | number;
  name: string;
  participants?: number;   // current members
  streams?: number;        // active video streams
  activeAt?: string;       // ISO timestamp or human string
  thumbUrl?: string | null;
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
      >
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt={`${name} thumbnail`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(180deg, rgba(40,40,40,0.9), rgba(20,20,20,0.9))",
            }}
          />
        )}
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
