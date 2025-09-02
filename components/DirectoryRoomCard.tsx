"use client";

export type DirectoryMember = { uid: string; cameraOn: boolean };
export type DirectoryRoom = {
  name: string;
  description?: string;
  totalUsers: number;
  totalCameraOn: number;
  members: DirectoryMember[];
};

export default function DirectoryRoomCard({
  room, bucket,
}: { room: DirectoryRoom; bucket: number }) {
  const cams = room.members.filter(m => m.cameraOn);
  return (
    <div className="room-card">
      <div className="room-card__header">
        <div className="room-card__title">{room.name}</div>
        <div className="room-card__counts">
          <span>👥 {room.totalUsers}</span>
          <span>🎥 {room.totalCameraOn}</span>
        </div>
      </div>
      <div className="room-card__mosaic">
        {cams.length ? cams.slice(0,6).map(m => {
          const src = `/api/directory/rooms/${encodeURIComponent(room.name)}/member/${encodeURIComponent(m.uid)}/thumb?cb=${bucket}`;
          return <img key={m.uid} src={src} alt={`${room.name}-${m.uid}`} loading="lazy" />;
        }) : <div className="room-card__mosaic-empty">No cameras active</div>}
      </div>
      <div className="room-card__desc">
        {room.description || <span style={{opacity:.65}}>No description.</span>}
      </div>
    </div>
  );
}
