// app/room/[username]/page.tsx
import React from "react";
import DeviceSelectors from "@/components/DeviceSelectors";

type Props = { params: { username: string } };

export default function RoomPage({ params: { username } }: Props) {
  const TITLE = (username ?? "").toUpperCase();

  return (
    // Full-bleed and full-height so columns reach the footer
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen h-full my-[-1.5rem]">
      <div className="h-full grid gap-3 px-0 lg:grid-cols-[8rem,1fr,22rem] md:grid-cols-1">
        {/* USERS (left) */}
        <aside className="panel h-full flex flex-col overflow-hidden rounded-l-none">
          <div className="px-3 py-2 border-b border-white/10 text-xs font-semibold tracking-wide uppercase text-white/70 text-center">
            Users
          </div>
          <div className="flex-1 overflow-auto px-3 py-2">
            <ul className="space-y-1 text-xs">
              <li className="list-disc list-inside">SEYMOUR (you)</li>
            </ul>
          </div>
        </aside>

        {/* VIDEO (center) */}
        <section className="panel h-full flex flex-col overflow-hidden">
          {/* HEADER: title left, device selects right */}
          <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-widest">{TITLE}</h1>

            {/* Camera & Mic dropdowns pinned on the right */}
            <DeviceSelectors />
          </header>

          {/* Video grid area grows to fill space */}
          <div className="flex-1 p-2 overflow-hidden">
            {/* <VideoGrid className="h-full w-full" /> */}
            <div className="h-full grid place-items-center opacity-70 text-sm">
              Your video grid mounts here.
            </div>
          </div>

          {/* Controls just above footer */}
          <div className="mt-auto border-t border-white/10 bg-[#0b1220]/70 backdrop-blur-sm">
            <div className="flex justify-center gap-3 p-3">
              <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-semibold">
                Stop Broadcasting
              </button>
              <button className="px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 font-semibold">
                Camera On/Off
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold">
                Mute Microphone
              </button>
            </div>
          </div>
        </section>

        {/* CHAT (right) */}
        <aside className="panel h-full flex flex-col overflow-hidden rounded-r-none">
          <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold tracking-wide uppercase text-white/70 text-center">
            Chat
          </div>
          <div className="flex-1 overflow-auto p-3">
            <div className="text-xs opacity-70 mb-2">No messages yet.</div>
          </div>
          <form className="border-t border-white/10 p-3 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-white/20"
            />
            <button className="rounded-md px-3 py-2 bg-white/10 hover:bg-white/20">Send</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
