// File: components/BroadcastControls.tsx

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Idle:   [Start Broadcasting] (green) + [Deafen/Undeafen]
 * Live:   [Stop Broadcasting] (red) + [Camera Hide/Unhide] + [Microphone Mute/Unmute] + [Deafen/Undeafen]
 *
 * Notes:
 * - No code path renders a red "Start Broadcasting".
 * - Emits:
 *    • 'ezchat:broadcast-started'  detail: { stream: MediaStream }
 *    • 'ezchat:broadcast-stopped'
 */

export type BroadcastControlsProps = {
  className?: string
}

export default function BroadcastControls({ className }: BroadcastControlsProps) {
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [deafened, setDeafened] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const deafenObserverRef = useRef<MutationObserver | null>(null)
  const strayBtnObserverRef = useRef<MutationObserver | null>(null)

  const baseBtn =
    'px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.98] focus:outline-none focus:ring'
  const green = 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-300'
  const red = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300'
  const slate = 'bg-slate-700 hover:bg-slate-800 text-white focus:ring-slate-400'

  const dispatch = (name: string, detail?: any) => {
    window.dispatchEvent(new CustomEvent(name, { detail }))
  }

  // ========== Start / Stop ==========
  const startBroadcast = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      stream.getVideoTracks().forEach(t => (t.enabled = true))
      stream.getAudioTracks().forEach(t => (t.enabled = true))
      streamRef.current = stream
      setCameraOn(true)
      setMicOn(true)
      setIsBroadcasting(true) // flip UI only after stream acquired
      dispatch('ezchat:broadcast-started', { stream })
    } catch (e: any) {
      setError(e?.message || 'Failed to access camera/microphone.')
      streamRef.current = null
      setIsBroadcasting(false)
    }
  }, [])

  const stopBroadcast = useCallback(() => {
    // Tell listeners first so UI clears immediately
    dispatch('ezchat:broadcast-stopped')

    const s = streamRef.current
    if (s) {
      for (const tr of s.getTracks()) {
        try { tr.stop() } catch {}
      }
    }
    streamRef.current = null

    setIsBroadcasting(false)
    setCameraOn(true)
    setMicOn(true)
  }, [])

  // ========== Toggles ==========
  const toggleCamera = useCallback(() => {
    setCameraOn(prev => {
      const next = !prev
      streamRef.current?.getVideoTracks().forEach(t => (t.enabled = next))
      return next
    })
  }, [])

  const toggleMic = useCallback(() => {
    setMicOn(prev => {
      const next = !prev
      streamRef.current?.getAudioTracks().forEach(t => (t.enabled = next))
      return next
    })
  }, [])

  // ========== Deafen (mute page outputs) ==========
  const applyDeafen = useCallback((on: boolean) => {
    const media = document.querySelectorAll<HTMLMediaElement>('audio, video')
    media.forEach(el => {
      if (on) {
        if (!el.muted) (el as any).dataset.mutedByDeafen = '1'
        el.muted = true
      } else if ((el as any).dataset.mutedByDeafen === '1') {
        el.muted = false
        delete (el as any).dataset.mutedByDeafen
      }
    })
  }, [])

  useEffect(() => {
    if (!deafened) {
      deafenObserverRef.current?.disconnect()
      deafenObserverRef.current = null
      return
    }
    applyDeafen(true)
    const obs = new MutationObserver(muts => {
      for (const m of muts) {
        m.addedNodes.forEach(n => {
          if (n instanceof HTMLElement) {
            n.querySelectorAll('audio, video').forEach(el => {
              if (!el.muted) (el as any).dataset.mutedByDeafen = '1'
              el.muted = true
            })
          }
        })
      }
    })
    obs.observe(document.body, { childList: true, subtree: true })
    deafenObserverRef.current = obs
    return () => { obs.disconnect(); deafenObserverRef.current = null }
  }, [deafened, applyDeafen])

  // ========== Nuke stray "Start Broadcasting" buttons while live ==========
  useEffect(() => {
    const hideStrays = () => {
      const buttons = Array.from(document.querySelectorAll<HTMLElement>('button, [role="button"]'))
      for (const b of buttons) {
        if (rootRef.current && rootRef.current.contains(b)) continue // ignore our own
        const label = (b.textContent || '').trim().toLowerCase()
        if (label === 'start broadcasting') {
          b.style.display = isBroadcasting ? 'none' : ''
        }
      }
    }
    hideStrays()
    strayBtnObserverRef.current?.disconnect()
    const obs = new MutationObserver(hideStrays)
    obs.observe(document.body, { childList: true, subtree: true, characterData: true })
    strayBtnObserverRef.current = obs
    return () => { obs.disconnect(); strayBtnObserverRef.current = null }
  }, [isBroadcasting])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcast()
      if (deafened) applyDeafen(false)
    }
  }, [stopBroadcast, deafened, applyDeafen])

  // ---------- UI ----------
  const Idle = useMemo(() => (
    <div className="flex items-center gap-3" data-state="idle">
      <button className={`${baseBtn} ${green}`} onClick={startBroadcast} aria-label="Start Broadcasting">
        <span className="pointer-events-none select-none">Start Broadcasting</span>
      </button>
      <button
        className={`${baseBtn} ${slate}`}
        onClick={() => setDeafened(d => { const n = !d; applyDeafen(n); return n })}
        aria-pressed={deafened}
      >
        <span className="pointer-events-none select-none">{deafened ? 'Undeafen' : 'Deafen'}</span>
      </button>
    </div>
  ), [baseBtn, green, slate, startBroadcast, deafened, applyDeafen])

  const Live = useMemo(() => (
    <div className="flex items-center gap-3" data-state="live">
      <button className={`${baseBtn} ${red}`} onClick={stopBroadcast} aria-label="Stop Broadcasting">
        <span className="pointer-events-none select-none">Stop Broadcasting</span>
      </button>
      <button
        className={`${baseBtn} ${cameraOn ? red : green}`}
        onClick={toggleCamera}
        aria-pressed={!cameraOn}
        aria-label={cameraOn ? 'Camera Hide' : 'Camera Unhide'}
      >
        <span className="pointer-events-none select-none">{cameraOn ? 'Camera Hide' : 'Camera Unhide'}</span>
      </button>
      <button
        className={`${baseBtn} ${micOn ? red : green}`}
        onClick={toggleMic}
        aria-pressed={!micOn}
        aria-label={micOn ? 'Microphone Mute' : 'Microphone Unmute'}
      >
        <span className="pointer-events-none select-none">{micOn ? 'Microphone Mute' : 'Microphone Unmute'}</span>
      </button>
      <button
        className={`${baseBtn} ${slate}`}
        onClick={() => setDeafened(d => { const n = !d; applyDeafen(n); return n })}
        aria-pressed={deafened}
      >
        <span className="pointer-events-none select-none">{deafened ? 'Undeafen' : 'Deafen'}</span>
      </button>
    </div>
  ), [baseBtn, red, green, slate, stopBroadcast, toggleCamera, toggleMic, cameraOn, micOn, deafened, applyDeafen])

  return (
    <div ref={rootRef} className={className} data-live={isBroadcasting ? '1' : '0'}>
      {isBroadcasting ? Live : Idle}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}
