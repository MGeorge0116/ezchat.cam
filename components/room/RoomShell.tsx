"use client";

import { useMemo } from "react";

// point imports to the folder that actually exists on your repo (capital R)
import UsersList from "@/components/room/UsersList";
import VideoGrid from "@/components/room/VideoGrid";
import ChatPanel from "@/components/room/ChatPanel";
import BroadcastControls from "@/components/room/BroadcastControls";
import DeviceSelectors from "@/components/room/DeviceSelectors";

type Props = { roomName: string };

export default function RoomShell({ roomName }: Props) {
  const room = useMemo(() => roomName.trim().toLowerCase(), [roomName]);

  return (
    <div className="flex h-full gap-4">
      {/* Left: Users */}
      <aside className="w-64 shrink-0">
        <UsersList room={room} />
      </aside>

      {/* Middle: Device selectors + Video + Controls */}
      <main className="flex-1 flex flex-col gap-3">
        <DeviceSelectors room={room} />
        <div className="rounded-lg border bg-card p-3">
          <VideoGrid room={room} />
        </div>
        <div className="mt-2">
          <BroadcastControls room={room} />
        </div>
      </main>

      {/* Right: Chat */}
      <aside className="w-80 shrink-0">
        <ChatPanel room={room} />
      </aside>
    </div>
  );
}
