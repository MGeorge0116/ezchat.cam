// File: components/RoomGrid.tsx

'use client'

import React from 'react'
import type { Room } from '../types/room'
import RoomCard from './RoomCard'

/**
 * variant="promoted": renders exactly 5 slots (fills remainder with "RESERVED SLOT")
 * variant="active":   renders given rooms (caller enforces 20/page)
 */
export default function RoomGrid({
  rooms,
  variant,
  reservedSlots = 5,
  className,
}: {
  rooms: Room[]
  variant: 'promoted' | 'active'
  reservedSlots?: number
  className?: string
}) {
  if (variant === 'promoted') {
    const list = rooms.slice(0, reservedSlots)
    const placeholders = Math.max(0, reservedSlots - list.length)
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className || ''}`}>
        {list.map(r => <RoomCard key={r.id} room={r} />)}
        {Array.from({ length: placeholders }).map((_, i) => <RoomCard key={`reserved-${i}`} reserved />)}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className || ''}`}>
      {rooms.map(r => <RoomCard key={r.id} room={r} />)}
    </div>
  )
}
