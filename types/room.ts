// File: types/room.ts

export type Room = {
  id: string
  name: string
  owner: string
  viewers: number
  isLive: boolean
  isPromoted?: boolean
  thumbnailUrl?: string
}
