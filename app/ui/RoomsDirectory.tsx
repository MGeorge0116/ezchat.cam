// app/ui/RoomsDirectory.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Room = {
  id: string;
  name: string;
  title?: string;
  owner?: { username: string; image?: string };
};

export default function RoomsDirectory() {
  const [promotedRooms, setPromotedRooms] = useState<Room[]>([]);
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const pr = await fetch("/api/directory/rooms?promoted=true&limit=5");
        if (pr.ok) {
          const data = await pr.json();
          setPromotedRooms(Array.isArray(data) ? data : data?.rooms || []);
        }
        const ar = await fetch("/api/directory/rooms");
        if (ar.ok) {
          const data = await ar.json();
          setActiveRooms(Array.isArray(data) ? data : data?.rooms || []);
        }
      } catch (e) {
        console.error("Error fetching rooms:", e);
        setPromotedRooms([]);
        setActiveRooms([]);
      }
    }
    fetchRooms();
  }, []);

  return (
    <>
      <section>
        <h2 className="text-xl font-bold mb-4">Promoted Chat Rooms</h2>
        {promotedRooms.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No promoted rooms right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {promotedRooms.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.name}`}
                className="flex flex-col items-center p-3 rounded-xl border bg-[color:rgb(var(--card))] text-[color:rgb(var(--foreground))] hover:shadow-md"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border">
                  {room.owner?.image ? (
                    <Image
                      src={room.owner.image}
                      alt={room.owner.username}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                      ?
                    </div>
                  )}
                </div>
                <span className="mt-2 font-medium">{room.title || room.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">@{room.owner?.username}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Active Chat Rooms</h2>
        {activeRooms.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No active rooms right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {activeRooms.map((room) => (
              <Link
                key={room.id}
                href={`/room/${room.name}`}
                className="block rounded-xl border overflow-hidden bg-[color:rgb(var(--card))] text-[color:rgb(var(--foreground))] hover:shadow-md"
              >
                <div className="p-4">
                  <h3 className="font-medium">{room.title || room.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{room.owner?.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
