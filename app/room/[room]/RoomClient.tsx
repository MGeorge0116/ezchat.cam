// app/room/[room]/RoomClient.tsx
"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import VideoStage, { VideoStageHandle } from "@/components/Room/VideoStage"
import UserList from "@/components/room/UsersList"
import ChatPane from "@/components/Room/ChatPane"
import ControlsBar from "@/components/Room/ControlsBar"
import { getToken } from "@/lib/agora"
import { joinRoom, leaveRoom, heartbeat } from "@/lib/api"

// Keep sanitization simple & Agora-safe
function sanitizeChannel(raw: string): string {
  const cleaned = (raw ?? "").replace(/[^A-Za-z0-9_.:-]/g, "-").slice(0, 64)
  return cleaned || "room"
}

export default function RoomClient({ room }: { room: string }) {
  const channelName = useMemo(() => sanitizeChannel(room), [room])
  const stageRef = useRef<VideoStageHandle>(null)

  const [joined, setJoined] = useState(false)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [screenOn, setScreenOn] = useState(false)

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
    await getToken(channelName)
    setJoined(true)
    setMicOn(true)
    setCamOn(true)
    setScreenOn(false)
  }, [channelName])

  const handleStop = useCallback(() => {
    setJoined(false)
    setScreenOn(false)
  }, [])

  const handleLeave = useCallback(() => {
    setJoined(false)
    setScreenOn(false)
  }, [])

  const handleToggleMic = useCallback(async () => {
    if (!stageRef.current) return
    const on = await stageRef.current.toggleMic()
    setMicOn(on)
  }, [])

  const handleToggleCam = useCallback(async () => {
    if (!stageRef.current) return
    const on = await stageRef.current.toggleCam()
    setCamOn(on)
  }, [])

  const handleToggleScreen = useCallback(async () => {
    if (!stageRef.current) return
    const on = await stageRef.current.toggleScreen()
    setScreenOn(on)
  }, [])

  return (
    <div className="w-full h-screen flex overflow-hidden">
      {/* LEFT: User List — fixed width */}
      <aside className="w-[260px] min-w-[260px] max-w-[260px] border-r bg-black/20 flex flex-col">
        <div className="px-4 py-3 border-b">
          <h2 className="text-base font-semibold">Participants</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <UserList room={channelName} joined={joined} />
        </div>
      </aside>

      {/* CENTER: Camera/Broadcast Stage — flexible */}
      <main className="flex-1 flex flex-col bg-black/10">
        <div className="flex-1 p-4 overflow-hidden">
          <VideoStage ref={stageRef} joined={joined} channelName={channelName} />
        </div>

        {/* Controls under the stage */}
        <ControlsBar
          joined={joined}
          micEnabled={micOn}
          camEnabled={camOn}
          screenOn={screenOn}
          onStart={handleStart}
          onStop={handleStop}
          onLeave={handleLeave}
          onToggleMic={handleToggleMic}
          onToggleCam={handleToggleCam}
          onToggleScreen={handleToggleScreen}
        />
      </main>

      {/* RIGHT: Chat — fixed width */}
      <aside className="w-[360px] min-w-[360px] max-w-[360px] border-l bg-black/20 flex flex-col">
        <div className="px-4 py-3 border-b">
          <h2 className="text-base font-semibold">Chat</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChatPane room={channelName} />
        </div>
      </aside>
    </div>
  )
}
