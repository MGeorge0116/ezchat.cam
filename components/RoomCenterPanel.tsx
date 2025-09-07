// File: components/RoomCenterPanel.tsx

'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import VideoGrid from './VideoGrid'

export default function RoomCenterPanel({ username }: { username: string }) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [deafened, setDeafened] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deafenObserverRef = useRef<MutationObserver | null>(null)

  const btnBase =
    'px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] focus:outline-none focus:ring'
  const btnGreen = 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300'
  const btnRed   = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300'
  const btnSlate = 'bg-slate-700 hover:bg-slate-800 text-white focus:ring-slate-400'

  // Start: request camera+mic, flip UI ONLY after success
  const startBroadcast = useCallback(async () => {
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      s.getVideoTracks().forEach(t => (t.enabled = true))
      s.getAudioTracks().forEach(t => (t.enabled = true))
      setStream(s)
      setCameraOn(true)
      setMicOn(true)
      setIsBroadcasting(true)
    } catch (e: any) {
      setError(e?.message || 'Failed to access camera/microphone.')
      setStream(null)
      setIsBroadcasting(false)
    }
  }, [])

  // STOP: halt camera & mic tracks and remove the tile immediately
  const stopBroadcast = useCallback(() => {
    // 1) Remove the tile right away by clearing the stream
    setStream(prev => {
      if (prev) {
        // Stop ALL tracks (video + audio)
        prev.getTracks().forEach(tr => { try { tr.stop() } catch {} })
      }
      return null
    })
    // 2) Reset UI flags
    setIsBroadcasting(false)
    setCameraOn(true)
    setMicOn(true)
  }, [])

  // Toggles (enable/disable tracks without removing the tile)
  const toggleCamera = useCallback(() => {
    setCameraOn(prev => {
      const next = !prev
      stream?.getVideoTracks().forEach(t => (t.enabled = next))
      return next
    })
  }, [stream])

  const toggleMic = useCallback(() => {
    setMicOn(prev => {
      const next = !prev
      stream?.getAudioTracks().forEach(t => (t.enabled = next))
      return next
    })
  }, [stream])

  // Deafen (mute all page media outputs)
  const applyDeafen = useCallback((on: boolean) => {
    const els = Array.from(document.querySelectorAll<HTMLMediaElement>('audio, video'))
    if (on) {
      els.forEach(el => {
        if (!el.muted) (el as any).dataset.mutedByDeafen = '1'
        el.muted = true
      })
    } else {
      els.forEach(el => {
        if ((el as any).dataset.mutedByDeafen === '1') {
          el.muted = false
          delete (el as any).dataset.mutedByDeafen
        }
      })
    }
  }, [])

  // Keep new media muted while deafened
  useEffect(() => {
    if (!deafened) {
      deafenObserverRef.current?.disconnect()
      deafenObserverRef.current = null
      return
    }
    applyDeafen(true)
    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        m.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            node.querySelectorAll('audio, video').forEach(el => {
              const media = el as HTMLMediaElement
              if (!media.muted) (media as any).dataset.mutedByDeafen = '1'
              media.muted = true
            })
          }
        })
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
    deafenObserverRef.current = obs
    return () => { obs.disconnect(); deafenObserverRef.current = null }
  }, [deafened, applyDeafen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setStream(prev => {
        if (prev) prev.getTracks().forEach(tr => { try { tr.stop() } catch {} })
        return null
      })
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Center video section */}
      <VideoGrid
        username={username}
        stream={stream}
        cameraOn={cameraOn}
        micOn={micOn}
        className="w-full"
        showPlaceholder
      />

      {/* Buttons BELOW the grid */}
      <div className="w-full flex flex-wrap items-center gap-3">
        {!isBroadcasting ? (
          <button
            className={`${btnBase} ${btnGreen}`}
            onClick={startBroadcast}
            aria-label="Start Broadcasting"
          >
            Start Broadcasting
          </button>
        ) : (
          <>
            <button
              className={`${btnBase} ${btnRed}`}
              onClick={stopBroadcast}
              aria-label="Stop Broadcasting"
            >
              Stop Broadcasting
            </button>
            <button
              className={`${btnBase} ${cameraOn ? btnRed : btnGreen}`}
              onClick={toggleCamera}
              aria-pressed={!cameraOn}
              aria-label={cameraOn ? 'Camera Hide' : 'Camera Unhide'}
            >
              {cameraOn ? 'Camera Hide' : 'Camera Unhide'}
            </button>
            <button
              className={`${btnBase} ${micOn ? btnRed : btnGreen}`}
              onClick={toggleMic}
              aria-pressed={!micOn}
              aria-label={micOn ? 'Microphone Mute' : 'Microphone Unmute'}
            >
              {micOn ? 'Microphone Mute' : 'Microphone Unmute'}
            </button>
          </>
        )}

        <button
          className={`${btnBase} ${btnSlate}`}
          onClick={() => {
            setDeafened(d => {
              const next = !d
              applyDeafen(next)
              return next
            })
          }}
          aria-pressed={deafened}
          aria-label={deafened ? 'Undeafen' : 'Deafen'}
        >
          {deafened ? 'Undeafen' : 'Deafen'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
