"use client";

import * as React from "react";
import UsersList from "@/components/room/UsersList";
import RoomCenterPanel from "@/components/RoomCenterPanel";
import ChatPane from "@/components/ChatPane";

export interface RoomShellProps {
  username: string;
}

export default function RoomShell({ username }: RoomShellProps) {
  const room = username; // Room name is the route param owner

  return (
    <div className="mx-auto grid h-[calc(100vh-6rem)] w-full max-w-7xl grid-cols-[220px_1fr_320px] gap-3 px-3 py-3">
      {/* Left: Users list (thin sidebar) */}
      <aside className="rounded-2xl border border-neutral-700/50 p-2">
        <h2 className="mb-2 text-center text-sm font-semibold opacity-90">USERS</h2>
        <UsersList room={room} />
      </aside>

      {/* Center: Video stage + device selectors above + controls below */}
      <main className="rounded-2xl border border-neutral-700/50">
        <div className="flex items-center justify-center border-b border-neutral-800 p-2">
          <h1 className="text-lg font-bold tracking-wide">{room.toUpperCase()}</h1>
        </div>
        <div className="h-[calc(100%-3rem)]">
          <RoomCenterPanel room={room} className="h-full" />
        </div>
      </main>

      {/* Right: Chat */}
      <aside className="rounded-2xl border border-neutral-700/50 p-2">
        <ChatPane room={room} />
      </aside>
    </div>
  );
}
