"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import DeviceMenus from "@/components/Room/DeviceMenus"
import VideoGrid from "@/components/Room/VideoGrid"
import UserList from "@/components/Room/UserList"
import ChatPane from "@/components/Room/ChatPane"
import ControlsBar from "@/components/Room/ControlsBar"
import { getToken } from "@/lib/agora"
import { joinRoom, leaveRoom, heartbeat } from "@/lib/api"

// Keep sanitization simple and Agora-safe.
function sanitizeChannel(raw: string): string {
  const cleaned = (raw ?? "")
    .replace(/[^A-Za-z0-9_.:-]/g, "-") // replace unsupported with '-'
    .slice(0, 64)
  return cleaned || "room"
}

export default function RoomClient({ room }: { room: string }) {
  const channelName = useMemo(() => sanitizeChannel(room), [room])

  const [joined, setJoined] = useState(false)
  const [cameraId, setCameraId] = useState<string | null>(null)
  const [micId, setMicId] = useState<string | null>(null)

  // Presence lifecycle
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    if (joined) {
      joinRoom(channelName).catch(() => {})
      interval = setInterval(() => heartbeat(channelName).catch(() => {}), 15000)
    }
    return () => {
      if (interval) clearInterval(interval)
      if (joined) leaveRoom(channelName).catch(() => {})
    }
  }, [joined, channelName])

  const handleStart = useCallback(async () => {
    // Touch token endpoint (server will validate channel) before joining RTC in the grid
    await getToken(channelName)
    setJoined(true)
  }, [channelName])

  const handleStop = useCallback(() => {
    setJoined(false)
  }, [])

  const handleLeave = useCallback(() => {
    setJoined(false)
  }, [])

  return (
    <div className="grid grid-cols-12 h-screen">
      {/* Left: User list */}
      <div className="col-span-2 border-r">
        <UserList room={channelName} joined={joined} />
      </div>

      {/* Middle: Camera section */}
      <div className="col-span-7 flex flex-col">
        {/* Centered device selectors at the very top */}
        <DeviceMenus
          selectedCameraId={cameraId}
          selectedMicId={micId}
          onSelectCamera={setCameraId}
          onSelectMic={setMicId}
        />

        {/* Video area (fills) */}
        <div className="flex-1">
          <VideoGrid
            joined={joined}
            channelName={channelName}
            cameraId={cameraId ?? undefined}
            micId={micId ?? undefined}
          />
        </div>

        {/* Controls under the video, centered */}
        <ControlsBar
          joined={joined}
          onStart={handleStart}
          onStop={handleStop}
          onLeave={handleLeave}
        />
      </div>

      {/* Right: Chat pane */}
      <div className="col-span-3 border-l">
        <ChatPane room={channelName} />
      </div>
    </div>
  )
}
