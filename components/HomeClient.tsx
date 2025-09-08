"use client";

import * as React from "react";
import Link from "next/link";

type RoomCard = {
  username: string;
  description?: string | null;
  avatarDataUrl?: string | null;
  isLive?: boolean;
  broadcasters?: number;
  users?: number;
  promoted?: boolean;
};

interface HomeClientProps {
  /** If you already have rooms from an API, pass them in. Otherwise we’ll look at localStorage. */
  initialRooms?: RoomCard[];
}

export default function HomeClient({ initialRooms }: HomeClientProps) {
  const [rooms, setRooms] = React.useState<RoomCard[]>(initialRooms ?? []);

  React.useEffect(() => {
    if (initialRooms && initialRooms.length) return;
    // Non-breaking: read any directory snapshot your app writes to localStorage.
    // If none exists, we leave rooms empty (UI still renders).
    try {
      const raw = localStorage.getItem("directory:rooms");
      if (raw) {
        const parsed = JSON.parse(raw) as RoomCard[];
        setRooms(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      // ignore
    }
  }, [initialRooms]);

  const promoted = rooms.filter((r) => r.promoted);
  const active = rooms.filter((r) => !r.promoted);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">EZChat.Cam</h1>
        {/* Replaces <a href="/">…</a> with Link to satisfy Next rule */}
        <Link href="/" className="underline hover:no-underline">
          Home
        </Link>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-center text-xl font-semibold">Promoted Rooms</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promoted.length === 0 ? (
            <div className="col-span-full text-center text-sm opacity-70">
              No promoted rooms yet.
            </div>
          ) : (
            promoted.map((r) => <RoomItem key={`promoted:${r.username}`} room={r} />)
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-center text-xl font-semibold">Active Rooms</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.length === 0 ? (
            <div className="col-span-full text-center text-sm opacity-70">
              No active rooms right now.
            </div>
          ) : (
            active.map((r) => <RoomItem key={`active:${r.username}`} room={r} />)
          )}
        </div>
      </section>
    </div>
  );
}

function RoomItem({ room }: { room: RoomCard }) {
  const href = `/room/${room.username}`;
  return (
    <Link
      href={href}
      className="rounded-2xl border border-neutral-700/40 p-4 shadow-sm transition hover:border-neutral-500/60"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold">{room.username.toUpperCase()}</div>
        {room.isLive ? (
          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">LIVE</span>
        ) : (
          <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-xs text-white">OFF</span>
        )}
      </div>
      {room.description && (
        <p className="line-clamp-2 text-sm opacity-80">{room.description}</p>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs opacity-80">
        <span>Broadcasters: {room.broadcasters ?? 0}</span>
        <span>Users: {room.users ?? 0}</span>
      </div>
    </Link>
  );
}
