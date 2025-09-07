// File: components/VideoGrid.tsx

'use client'

import React, { useMemo } from 'react'
import VideoTile from './VideoTile'

export type Tile = {
  id: string
  username: string
  stream: MediaStream
  isLocal?: boolean
}

export default function VideoGrid({
  tiles,
  className,
}: {
  tiles: Tile[]
  className?: string
}) {
  const count = tiles.length

  // Decide grid columns based on number of tiles
  // 1 -> 1 col
  // 2 -> 2 cols
  // 3-4 -> 2 cols
  // 5-6 -> 3 cols
  // 7-9 -> 3 cols
  // 10-12 -> 4 cols
  const cols = useMemo(() => {
    if (count <= 1) return 1
    if (count === 2) return 2
    if (count <= 4) return 2
    if (count <= 6) return 3
    if (count <= 9) return 3
    return 4
  }, [count])

  // Adjust tile height to keep the grid pleasant as it fills
  const heightClass = useMemo(() => {
    if (count <= 1) return 'h-[56vh]'
    if (count === 2) return 'h-[48vh]'
    if (count <= 4) return 'h-[40vh]'
    if (count <= 6) return 'h-[32vh]'
    if (count <= 9) return 'h-[26vh]'
    return 'h-[22vh]'
  }, [count])

  // Tailwind grid-cols utilities for 1..4
  const gridColsClass =
    cols === 1 ? 'grid-cols-1' :
    cols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  return (
    <div
      className={`
        grid ${gridColsClass}
        gap-4 md:gap-6 place-items-center w-full
        ${className || ''}
      `}
    >
      {tiles.map(t => (
        <VideoTile
          key={t.id}
          id={t.id}
          username={t.username}
          stream={t.stream}
          isLocal={t.isLocal}
          heightClass={heightClass}
        />
      ))}
    </div>
  )
}
