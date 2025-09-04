"use client"

import { useState } from "react"

interface Props {
  joined: boolean
  onToggleBroadcast: () => void
  onLeave: () => void
}

export default function RoomControls({ joined, onToggleBroadcast, onLeave }: Props) {
  const [micEnabled, setMicEnabled] = useState(false)

  const handleMicToggle = () => {
    setMicEnabled(!micEnabled)
  }

  return (
    <div className="flex gap-2 p-2">
      {/* Only show mic button if broadcasting */}
      {joined && (
        <button
          onClick={handleMicToggle}
          className={`px-4 py-2 rounded-md ${
            micEnabled ? "bg-green-600 text-white" : "bg-gray-600 text-white"
          }`}
        >
          {micEnabled ? "Mic (on)" : "Mic (off)"}
        </button>
      )}

      <button
        onClick={onToggleBroadcast}
        className="px-4 py-2 rounded-md bg-blue-600 text-white"
      >
        {joined ? "Stop Broadcasting" : "Start Broadcasting"}
      </button>

      <button
        onClick={onLeave}
        className="px-4 py-2 rounded-md bg-red-600 text-white"
      >
        Leave
      </button>
    </div>
  )
}
