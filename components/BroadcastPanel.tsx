// File: components/BroadcastPanel.tsx

'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import VideoGrid, { type Tile } from './VideoGrid'

export default function BroadcastPanel({
  username,
  className,
  maxBroadcasters = 12,
}: {
  username: string
  className?: string
  /** hard ceiling of broadcasters allowed */
  maxBroadcasters?: number
}) {
  // All live tiles (local + remote). This demo manages only the local tile out of the box.
  const [tiles, setTiles] = useState<Tile[]>([])
  const [live, setLive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  // Styles
  const btnBase =
    'px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] focus:outline-none focus:ring'
  const btnGreen = 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300'
  const btnRed   = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300'

  // START: add a local tile if we have capacity
  const start = useCallback(async () => {
    setError(null)

    if (tiles.length >= maxBroadcasters) {
      setError(`Max broadcasters reached (${maxBroadcasters}).`)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getVideoTracks().forEach(t => (t.enabled = true))
      stream.getAudioTracks().forEach(t => (t.enabled = true))
      localStreamRef.current = stream

      setTiles(prev => {
        // If something already added a local tile, replace it
        const withoutLocal = prev.filter(t => t.id !== 'local')
        return [{ id: 'local', username, stream, isLocal: true }, ...withoutLocal].slice(0, maxBroadcasters)
      })

      setLive(true) // only flip after success
    } catch (e: any) {
      setError(e?.message || 'Failed to access camera/microphone.')
      localStreamRef.current = null
      setLive(false)
    }
  }, [tiles.length, maxBroadcasters, username])

  // STOP: tear down the local tracks + remove local tile immediately
  const stop = useCallback(() => {
    // Stop tracks
    const s = localStreamRef.current
    if (s) {
      for (const tr of s.getTracks()) {
        try { tr.stop() } catch {}
      }
    }
    localStreamRef.current = null

    // Remove local tile instantly
    setTiles(prev => prev.filter(t => t.id !== 'local'))
    setLive(false)
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      const s = localStreamRef.current
      if (s) {
        for (const tr of s.getTracks()) {
          try { tr.stop() } catch {}
        }
      }
      localStreamRef.current = null
    }
  }, [])

  // (Optional) Helpers to simulate remote joins/leaves in your own code later:
  // window.dispatchEvent(new CustomEvent('demo:add-remote', { detail: { id, username, stream } }))
  // window.dispatchEvent(new CustomEvent('demo:remove-remote', { detail: { id } }))
  useEffect(() => {
    const onAdd = (e: Event) => {
      const { id, username: u, stream } = (e as CustomEvent).detail || {}
      if (!id || !u || !stream) return
      setTiles(prev => {
        // enforce max 12
        const next: Tile[] = [{ id: String(id), username: String(u), stream }, ...prev.filter(t => t.id !== String(id))]
        return next.slice(0, maxBroadcasters)
      })
    }

    const onRemove = (e: Event) => {
      const { id } = (e as CustomEvent).detail || {}
      if (!id) return
      setTiles(prev => prev.filter(t => t.id !== String(id)))
    }

    window.addEventListener('demo:add-remote', onAdd)
    window.addEventListener('demo:remove-remote', onRemove)
    return () => {
      window.removeEventListener('demo:add-remote', onAdd)
      window.removeEventListener('demo:remove-remote', onRemove)
    }
  }, [maxBroadcasters])

  return (
    <div className={`flex flex-col items-center gap-4 w-full ${className || ''}`}>
      {/* Dynamic grid (auto-sizes based on tile count) */}
      <VideoGrid tiles={tiles} className="w-full" />

      {/* Single toggle button below the grid */}
      <div className="w-full flex items-center justify-center">
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
