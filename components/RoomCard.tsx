// File: components/RoomCard.tsx

'use client'

import Link from 'next/link'
import React from 'react'
import type { Room } from '../types/room'

export default function RoomCard({
  room,
  reserved = false,
}: { room?: Room; reserved?: boolean }) {
  if (reserved || !room) {
    return (
      <div
        className="
          relative rounded-2xl border-2 border-dashed border-white/20
          bg-black/30 p-4 min-h-[160px] w-full
          flex items-center justify-center text-center
        "
      >
        <div>
          <p className="text-white/70 font-semibold tracking-wide">RESERVED SLOT</p>
          <p className="text-white/50 text-sm">Promote your room to appear here</p>
        </div>
      </div>
    )
  }

  const name = room.name.toUpperCase()

  return (
    <Link
      href={`/room/${encodeURIComponent(room.id)}`}
      className="
        group relative rounded-2xl overflow-hidden ring-1 ring-white/10
        bg-gradient-to-br from-slate-900 to-black hover:ring-white/20 transition w-full
      "
    >
      <div className="aspect-video w-full bg-black/40 flex items-center justify-center">
        {room.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={room.thumbnailUrl} alt={room.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-white/30 text-xs">No thumbnail</div>
        )}
      </div>

      <div className="p-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-white font-extrabold tracking-wide uppercase text-base sm:text-lg truncate">
            {name}
          </div>
          <div className="text-white/60 text-xs sm:text-sm truncate">@{room.owner}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {room.isLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600/20 text-red-300 px-2 py-0.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500 block" />
              LIVE
            </span>
          )}
          <span className="text-white/70 text-xs">{room.viewers} watching</span>
        </div>
      </div>
    </Link>
  )
}
