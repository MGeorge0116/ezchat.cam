// components/room/RoomShell.tsx
"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import UsersList from "./UsersList";
import VideoGrid from "./VideoGrid";
import ChatPanel from "./ChatPanel";
import BroadcastControls from "./BroadcastControls";
import { useRoomHeartbeat } from "./hooks";

type Props = { roomName?: string };

export default function RoomShell({ roomName }: Props) {
  const pathname = usePathname();

  const resolvedRoomName = useMemo(() => {
    if (roomName && roomName.trim()) return roomName.trim().toLowerCase();
    const parts = (pathname || "").split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "room");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1].toLowerCase();

    const ls =
      localStorage.getItem("room:last") ||
      localStorage.getItem("auth:username") ||
      localStorage.getItem("profile:username") ||
      localStorage.getItem("ui:username");

    return (ls || "myroom").toLowerCase();
  }, [pathname, roomName]);

  try {
    localStorage.setItem("room:last", resolvedRoomName);
  } catch {}

  useRoomHeartbeat(resolvedRoomName);

  const TITLE = resolvedRoomName.toUpperCase();

  return (
    <div className="w-full h-full grid grid-cols-[220px_1fr_360px] gap-4 p-4">
      {/* Left: USERS */}
      <aside className="h-full">
        <UsersList room={resolvedRoomName} />
      </aside>

      {/* Center: Title, VideoGrid (fills), then Controls BELOW */}
      <main className="h-full flex flex-col gap-3">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-semibold tracking-wide">{TITLE}</h1>
        </div>

        {/* Video section grows to fill available vertical space */}
        <div className="flex-1 min-h-0">
          <VideoGrid room={resolvedRoomName} />
        </div>

        {/* Controls are BELOW the camera broadcasting section */}
        <div className="pt-1">
          <BroadcastControls room={resolvedRoomName} />
        </div>
      </main>

      {/* Right: CHAT */}
      <aside className="h-full">
        <ChatPanel room={resolvedRoomName} />
      </aside>
    </div>
  );
}
