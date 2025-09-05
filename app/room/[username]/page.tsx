// app/room/[username]/page.tsx
export const runtime = "nodejs";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ⬇️ Use RELATIVE imports so the page builds even if '@/*' alias isn't working
import UsersList from "../../../components/UsersList";
import VideoGrid from "../../../components/VideoGrid";
import DeviceSelectors from "../../../components/DeviceSelectors";
import Controls from "../../../components/Controls";
import ChatMessages from "../../../components/ChatMessages";
import ChatInput from "../../../components/ChatInput";

export const metadata: Metadata = { title: "Room • EZCam.Chat" };

export default async function RoomPage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);

  const roomSlug = (params.username || "").toLowerCase();
  const roomTitle = roomSlug.toUpperCase();

  const sessionUser =
    ((session?.user as any)?.username as string | undefined) ||
    (session?.user?.email ? session.user.email.split("@")[0] : undefined) ||
    "GUEST";

  return (
    <div className="h-full min-h-0">
      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[260px,minmax(0,1fr),360px] gap-4">
        {/* LEFT: USERS */}
        <section aria-labelledby="users-title" className="panel col-start-1 row-start-1 row-span-3 h-full min-h-0 overflow-y-auto p-3">
          <h2 id="users-title" className="text-center text-xs font-semibold tracking-widest opacity-70">USERS</h2>
          <div className="mt-2">
            <UsersList room={roomSlug} />
          </div>
        </section>

        {/* MIDDLE: VIDEO */}
        <section aria-labelledby="video-title" className="panel col-start-1 md:col-start-2 row-start-2 md:row-start-1 row-span-3 flex h-full min-h-0 flex-col p-3">
          <div className="flex items-center justify-between">
            <h2 id="video-title" className="select-none text-2xl font-extrabold tracking-wide">{roomTitle}</h2>
            <div className="flex items-center gap-2">
              <DeviceSelectors />
            </div>
          </div>

          <div className="mt-3 flex-1 min-h-0 overflow-hidden rounded-xl border border-white/10 p-3">
            <VideoGrid roomName={roomSlug} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Controls roomName={roomSlug} username={sessionUser} />
          </div>
        </section>

        {/* RIGHT: CHAT */}
        <section aria-labelledby="chat-title" className="panel col-start-1 md:col-start-3 row-start-3 md:row-start-1 row-span-3 flex h-full min-h-0 flex-col p-3">
          <h2 id="chat-title" className="text-center text-xs font-semibold tracking-widest opacity-70">CHAT</h2>
          <div className="mt-2 flex-1 min-h-0 overflow-y-auto rounded-lg border border-white/10 p-3">
            <ChatMessages room={roomSlug} />
          </div>
          <div className="mt-3">
            <ChatInput room={roomSlug} username={sessionUser} />
          </div>
        </section>
      </div>
    </div>
  );
}
