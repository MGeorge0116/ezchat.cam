"use client";
import RoomShell from "./RoomShell";
export default function RoomClient({ roomName }: { roomName?: string }) {
  return <RoomShell roomName={roomName} />;
}
