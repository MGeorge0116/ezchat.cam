// components/Room/ControlsBar.tsx
"use client"

interface Props {
  joined: boolean
  micEnabled: boolean
  camEnabled: boolean
  screenOn: boolean
  onStart: () => void
  onStop: () => void
  onLeave: () => void
  onToggleMic: () => void
  onToggleCam: () => void
  onToggleScreen: () => void
}

export default function ControlsBar({
  joined,
  micEnabled,
  camEnabled,
  screenOn,
  onStart,
  onStop,
  onLeave,
  onToggleMic,
  onToggleCam,
  onToggleScreen,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-3 p-3 border-t bg-black/30">
      {!joined ? (
        <button
          onClick={onStart}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
        >
          Start Broadcasting
        </button>
      ) : (
        <>
          <button onClick={onToggleMic} className="px-4 py-2 rounded bg-gray-700 text-white">
            {micEnabled ? "Mic On" : "Mic Off"}
          </button>
          <button onClick={onToggleCam} className="px-4 py-2 rounded bg-gray-700 text-white">
            {camEnabled ? "Camera On" : "Camera Off"}
          </button>
          <button onClick={onToggleScreen} className="px-4 py-2 rounded bg-gray-700 text-white">
            {screenOn ? "Stop Share" : "Share Screen"}
          </button>
          <button onClick={onStop} className="px-4 py-2 rounded bg-yellow-600 text-white">
            Stop
          </button>
          <button onClick={onLeave} className="px-4 py-2 rounded bg-red-600 text-white">
            Leave
          </button>
        </>
      )}
    </div>
  )
}
