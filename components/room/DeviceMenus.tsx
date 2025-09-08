// components/Room/DeviceMenus.tsx
"use client"

import { useEffect, useState } from "react"

type MediaDevice = { deviceId: string; label: string }

interface Props {
  selectedCameraId?: string | null
  selectedMicId?: string | null
  onSelectCamera: (deviceId: string) => void
  onSelectMic: (deviceId: string) => void
}

export default function DeviceMenus({
  selectedCameraId,
  selectedMicId,
  onSelectCamera,
  onSelectMic,
}: Props) {
  const [cams, setCams] = useState<MediaDevice[]>([])
  const [mics, setMics] = useState<MediaDevice[]>([])
  const [loading, setLoading] = useState(true)

  async function probePermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getTracks().forEach((t) => t.stop())
    } catch {
      // If blocked, we still enumerate; labels may be generic
    }
  }

  async function loadDevices() {
    const list = await navigator.mediaDevices.enumerateDevices()
    const camList = list.filter(d => d.kind === "videoinput").map(d => ({ deviceId: d.deviceId, label: d.label || "Camera" }))
    const micList = list.filter(d => d.kind === "audioinput").map(d => ({ deviceId: d.deviceId, label: d.label || "Microphone" }))
    setCams(camList)
    setMics(micList)
    if (!selectedCameraId && camList[0]) onSelectCamera(camList[0].deviceId)
    if (!selectedMicId && micList[0]) onSelectMic(micList[0].deviceId)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await probePermissions()
      if (!mounted) return
      await loadDevices()
      setLoading(false)
    })()
    const onChange = () => loadDevices()
    navigator.mediaDevices.addEventListener("devicechange", onChange)
    return () => {
      mounted = false
      navigator.mediaDevices.removeEventListener("devicechange", onChange)
    }
  }, [])

  return (
    <div className="w-full flex justify-center gap-6 py-2 border-b bg-black/10">
      <div className="flex items-center gap-2">
        <label className="text-sm opacity-80">Camera</label>
        <select
          className="px-2 py-1 rounded-md border bg-black text-white"
          value={selectedCameraId ?? ""}
          onChange={(e) => onSelectCamera(e.target.value)}
          disabled={loading || cams.length === 0}
        >
          {cams.map(c => (
            <option key={c.deviceId} value={c.deviceId}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm opacity-80">Microphone</label>
        <select
          className="px-2 py-1 rounded-md border bg-black text-white"
          value={selectedMicId ?? ""}
          onChange={(e) => onSelectMic(e.target.value)}
          disabled={loading || mics.length === 0}
        >
          {mics.map(m => (
            <option key={m.deviceId} value={m.deviceId}>{m.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
