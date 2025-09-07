// components/room/RoomShell.tsx
"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import UsersList from "./UsersList";
import VideoGrid from "./VideoGrid";
import ChatPanel from "./ChatPanel";
import { useRoomHeartbeat } from "./hooks";
import DeviceSelectors from "./DeviceSelectors";

type Props = { roomName?: string };

export default function RoomShell({ roomName }: Props) {
  const pathname = usePathname();

  // Resolve room name robustly
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

  // Persist last visited room
  try {
    localStorage.setItem("room:last", resolvedRoomName);
  } catch {}

  // Directory + presence heartbeat
  useRoomHeartbeat(resolvedRoomName);

  const TITLE = resolvedRoomName.toUpperCase();

  return (
    <div className="w-full h-full grid grid-cols-[220px_1fr_360px] gap-4 p-4">
      {/* Left: USERS */}
      <aside className="h-full">
        <UsersList room={resolvedRoomName} />
      </aside>

      {/* Center: Title + Device selectors (visible when live) + VideoGrid */}
      <main className="h-full flex flex-col gap-2">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl font-semibold tracking-wide">{TITLE}</h1>
        </div>

        {/* New device dropdowns appear above the broadcast panel when live */}
        <DeviceSelectors room={resolvedRoomName} />

        {/* Video section grows to fill available vertical space */}
        <div className="flex-1 min-h-0">
          <VideoGrid room={resolvedRoomName} />
        </div>
      </main>

      {/* Right: CHAT */}
      <aside className="h-full">
        <ChatPanel room={resolvedRoomName} />
      </aside>
    </div>
  );
}
