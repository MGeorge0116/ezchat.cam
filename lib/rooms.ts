// File: lib/rooms.ts

import { Room } from '../types/room'

// ---------- Demo data so the page renders immediately ----------
const PROMOTED_IDS = ['room-1', 'room-2', 'room-3', 'room-4', 'room-5']
const TOTAL_ROOMS = 53 // to demonstrate multiple pages

const makeRoom = (i: number): Room => ({
  id: `room-${i}`,
  name: `Room ${i}`,
  owner: `owner${i}`,
  viewers: Math.floor(10 + (i * 37) % 500),
  isLive: true,
  isPromoted: PROMOTED_IDS.includes(`room-${i}`),
  thumbnailUrl: undefined, // drop in your image URL if you have one
})

const ALL_ROOMS: Room[] = Array.from({ length: TOTAL_ROOMS }, (_, i) => makeRoom(i + 1))
// ---------------------------------------------------------------

export type ListRoomsResult = {
  promoted: Room[]   // up to 5
  activePage: Room[] // 20 (or fewer on last page)
  totalActive: number
  totalPages: number
  page: number       // 1-indexed
  pageSize: number
}

/**
 * Returns the 5 promoted rooms (or reserved placeholders) and
 * a 20-per-page slice of active rooms (excluding promoted ones).
 */
export function listRooms({
  page = 1,
  pageSize = 20,
}: { page?: number; pageSize?: number }): ListRoomsResult {
  const promoted = ALL_ROOMS.filter(r => r.isPromoted).slice(0, 5)
  const activePool = ALL_ROOMS.filter(r => !r.isPromoted)

  const totalActive = activePool.length
  const safePageSize = Math.max(1, Math.floor(pageSize))
  const totalPages = Math.max(1, Math.ceil(totalActive / safePageSize))

  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages)
  const start = (safePage - 1) * safePageSize
  const activePage = activePool.slice(start, start + safePageSize)

  return { promoted, activePage, totalActive, totalPages, page: safePage, pageSize: safePageSize }
}
