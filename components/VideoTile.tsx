// File: components/VideoTile.tsx

'use client'

import React, { useEffect, useRef } from 'react'

export default function VideoTile({
  username,
  stream,
}: {
  username: string
  stream: MediaStream
}) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const label = (username ?? '').toUpperCase()

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (v.srcObject !== stream) v.srcObject = stream
    v.muted = true
    v.playsInline = true
    const play = async () => { try { await v.play() } catch {} }
    play()
    return () => {
      try {
        v.pause()
        ;(v as HTMLVideoElement).srcObject = null
      } catch {}
    }
  }, [stream])

  return (
    <div className="relative rounded-2xl shadow-lg overflow-hidden bg-black/60 ring-1 ring-white/10 w-full h-[58vh] max-h-[70vh] flex items-center justify-center">
      <video ref={ref} className="w-full h-full object-contain bg-black" autoPlay playsInline />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 text-white uppercase tracking-wider font-bold text-base sm:text-lg">
        {label}
      </div>
    </div>
  )
}
