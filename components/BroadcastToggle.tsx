// File: components/BroadcastToggle.tsx
// Pins the Start/Stop button just above the LAST <footer> on the page.
// Starts/stops webcam+mic and removes the camera on stop.

'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

type Props = { className?: string }

export default function BroadcastToggle({ className }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [live, setLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)
  const footerObserverRef = useRef<ResizeObserver | null>(null)

  const btnBase =
    'px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] focus:outline-none focus:ring'
  const btnGreen = 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300'
  const btnRed   = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300'

  // --- position button above the LAST footer on the page ---
  useEffect(() => {
    const getFooter = () => {
      const footers = Array.from(document.querySelectorAll('footer'))
      return footers.length ? footers[footers.length - 1] : null
    }

    const updateBottom = () => {
      const footer = getFooter()
      const gap = 16 // px spacing above footer
      const h = footer ? footer.getBoundingClientRect().height : 0
      if (barRef.current) barRef.current.style.bottom = `${h + gap}px`
    }

    updateBottom()
    window.addEventListener('resize', updateBottom)

    const footer = getFooter()
    if (footer && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateBottom)
      ro.observe(footer)
      footerObserverRef.current = ro
    }

    return () => {
      window.removeEventListener('resize', updateBottom)
      footerObserverRef.current?.disconnect()
      footerObserverRef.current = null
    }
  }, [])

  // --- start / stop broadcasting ---
  const start = useCallback(async () => {
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      s.getVideoTracks().forEach(t => (t.enabled = true))
      s.getAudioTracks().forEach(t => (t.enabled = true))
      setStream(s)
      setLive(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to access camera/microphone.')
      setStream(null)
      setLive(false)
    }
  }, [])

  const stop = useCallback(() => {
    setStream(prev => {
      if (prev) prev.getTracks().forEach(tr => { try { tr.stop() } catch {} })
      return null
    })
    setLive(false)
  }, [])

  // --- wire/unwire video element ---
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (stream) {
      if (v.srcObject !== stream) v.srcObject = stream
      v.muted = true
      v.playsInline = true
      const play = async () => { try { await v.play() } catch {} }
      play()
    } else {
      try {
        v.pause()
        ;(v as HTMLVideoElement).srcObject = null
      } catch {}
    }
  }, [stream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(tr => { try { tr.stop() } catch {} })
    }
  }, [stream])

  return (
    <div className={`flex flex-col items-center gap-4 w-full ${className || ''}`}>
      {/* Camera area (placeholder when idle) */}
      <div className="flex items-center justify-center w-full">
        {stream ? (
          <div className="relative rounded-2xl shadow-lg overflow-hidden bg-black/60 ring-1 ring-white/10 flex items-center justify-center w-full max-w-[960px] h-[50vh] max-h-[62vh]">
            <video
              ref={videoRef}
              className="w-[88%] max-w-[92%] h-full object-contain rounded-xl bg-black"
              autoPlay
              playsInline
            />
          </div>
        ) : (
          <div className="w-full flex items-center justify-center rounded-2xl border border-white/10 bg-black/30 min-h-[260px]">
            <p className="text-white/60 text-sm">No active cameras</p>
          </div>
        )}
      </div>

      {/* Fixed control bar near the (real) footer */}
      <div
        ref={barRef}
        className="fixed left-1/2 -translate-x-1/2 z-50"
        // bottom is set dynamically
      >
        {!live ? (
          <button className={`${btnBase} ${btnGreen}`} onClick={start} aria-label="Start Broadcasting">
            Start Broadcasting
          </button>
        ) : (
          <button className={`${btnBase} ${btnRed}`} onClick={stop} aria-label="Stop Broadcasting">
            Stop Broadcasting
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
