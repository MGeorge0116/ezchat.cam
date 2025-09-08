"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listActiveRooms, type DirectoryRoom } from "@/lib/reportDirectory";

export default function HomeDirectory() {
  const [rooms, setRooms] = useState<DirectoryRoom[]>([]);

  useEffect(() => {
    const read = () => setRooms(listActiveRooms());
    read();
    const id = setInterval(read, 4000);
    return () => clearInterval(id);
  }, []);

  const promoted = useMemo(() => rooms.filter((r) => r.promoted).slice(0, 8), [rooms]);
  const active   = useMemo(() => rooms.slice(0, 24), [rooms]);

  return (
    <div className="w-full">
      <h2 className="text-center text-xl font-semibold mb-3">Promoted Rooms</h2>
      {promoted.length === 0 ? (
        <div className="text-center text-sm opacity-70 mb-6">No promoted rooms right now.</div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
          {promoted.map((r) => <DirectoryCard key={`promo-${r.username}`} room={r} />)}
        </div>
      )}

      <h2 className="text-center text-xl font-semibold mb-3">Active Rooms</h2>
      {active.length === 0 ? (
        <div className="text-center text-sm opacity-70">No active rooms yet.</div>
      ) : (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {active.map((r) => <DirectoryCard key={`active-${r.username}`} room={r} />)}
        </div>
      )}
    </div>
  );
}

function DirectoryCard({ room }: { room: DirectoryRoom }) {
  const uname = (room?.username ?? "").trim().toLowerCase();
  const unameDisplay = uname ? uname.toUpperCase() : "UNKNOWN";
  const handle = uname ? `@${uname}` : "";
  const isLive = !!room?.isLive;

  const avatar =
    (typeof room?.avatarDataUrl === "string" && room.avatarDataUrl) ||
    (uname ? localStorage.getItem(`profile:avatar:${uname}`) || "" : "");

  const desc = (room?.description || "").trim();
  const broadcasters = Math.min(Number(room?.broadcasters || 0), 12);
  const usersInRoom  = Number(room?.watching || 0);

  return (
    <Link
      href={uname ? `/room/${uname}` : "#"}
      className="rounded-2xl border border-white/10 bg-white/5 block overflow-hidden hover:border-white/20"
    >
      <div className="w-full aspect-video bg-black/40 relative">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={`${uname} avatar`} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm opacity-70">No thumbnail</div>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{unameDisplay}</div>
          {isLive && <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-600 text-white">● LIVE</span>}
        </div>

        <div className="text-xs opacity-80 line-clamp-2 min-h-[1.25rem]">
          {desc || "—"}
        </div>

        <div className="flex items-center text-xs opacity-70 gap-3">
          <span>Broadcasters: {broadcasters}/12</span>
          <span className="ml-2">Users: {usersInRoom}</span>
          <span className="ml-auto">{handle}</span>
        </div>
      </div>
    </Link>
  );
}
