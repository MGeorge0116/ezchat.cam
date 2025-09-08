// components/Room/VideoStage.tsx
"use client"

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng"

export type VideoStageHandle = {
  toggleMic: () => Promise<boolean>
  toggleCam: () => Promise<boolean>
  toggleScreen: () => Promise<boolean>
}

interface Props {
  joined: boolean
  channelName: string
}

const VideoStage = forwardRef<VideoStageHandle, Props>(function VideoStage(
  { joined, channelName },
  ref
) {
  const client = useMemo(() => AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }), [])
  const [localCam, setLocalCam] = useState<ICameraVideoTrack | null>(null)
  const [localMic, setLocalMic] = useState<IMicrophoneAudioTrack | null>(null)
  const [screenTrack, setScreenTrack] = useState<any>(null)
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([])
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [screenOn, setScreenOn] = useState(false)

  useImperativeHandle(ref, () => ({
    async toggleMic() {
      if (!localMic) return micOn
      await localMic.setEnabled(!micOn)
      setMicOn(!micOn)
      return !micOn
    },
    async toggleCam() {
      if (!localCam) return camOn
      await localCam.setEnabled(!camOn)
      setCamOn(!camOn)
      return !camOn
    },
    async toggleScreen() {
      if (!screenOn) {
        const st = await AgoraRTC.createScreenVideoTrack({}, "auto")
        await client.publish(st as any)
        setScreenTrack(st)
        setScreenOn(true)
        return true
      } else {
        if (screenTrack) {
          await client.unpublish(screenTrack as any).catch(() => {})
          ;(screenTrack as any).stop?.()
          ;(screenTrack as any).close?.()
        }
        setScreenTrack(null)
        setScreenOn(false)
        return false
      }
    },
  }))

  useEffect(() => {
    if (!joined) {
      cleanup()
      client.leave().catch(() => {})
      setRemoteUsers([])
      setScreenOn(false)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        await client.join(
          process.env.NEXT_PUBLIC_AGORA_APP_ID!,
          channelName,
          null,
          null
        )

        const cam = await AgoraRTC.createCameraVideoTrack()
        const mic = await AgoraRTC.createMicrophoneAudioTrack()

        if (!mounted) {
          cam.close()
          mic.close()
          return
        }

        setLocalCam(cam)
        setLocalMic(mic)
        setCamOn(true)
        setMicOn(true)

        await client.publish([cam, mic])

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType)
          if (mounted) setRemoteUsers([...client.remoteUsers])
        })
        client.on("user-unpublished", () => mounted && setRemoteUsers([...client.remoteUsers]))
        client.on("user-left", () => mounted && setRemoteUsers([...client.remoteUsers]))
      } catch (e) {
        console.error("Agora join error", e)
      }
    })()

    return () => {
      mounted = false
      client.removeAllListeners()
      cleanup()
      client.leave().catch(() => {})
      setRemoteUsers([])
      setScreenOn(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, channelName])

  function cleanup() {
    if (screenTrack) {
      try { client.unpublish(screenTrack as any).catch(() => {}) } finally {
        ;(screenTrack as any)?.stop?.()
        ;(screenTrack as any)?.close?.()
        setScreenTrack(null)
      }
    }
    if (localCam) {
      try { client.unpublish(localCam).catch(() => {}) } finally {
        localCam.stop(); localCam.close(); setLocalCam(null)
      }
    }
    if (localMic) {
      try { client.unpublish(localMic).catch(() => {}) } finally {
        localMic.stop(); localMic.close(); setLocalMic(null)
      }
    }
  }

  return (
    <div className="w-full h-full rounded-xl border bg-black/40 p-3">
      {!joined && <div className="w-full h-[420px] rounded-lg bg-black/30" />}

      {joined && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 h-full">
          {/* Local tile */}
          {localCam && (
            <div className="relative bg-black rounded-xl shadow overflow-hidden">
              <video
                ref={(node) => { if (node && localCam) localCam.play(node) }}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                You
              </div>
            </div>
          )}

          {/* Remote tiles */}
          {remoteUsers.slice(0, Math.max(0, 12 - (localCam ? 1 : 0))).map((user) => (
            <div key={String(user.uid)} className="relative bg-black rounded-xl shadow overflow-hidden">
              <video
                ref={(node) => {
                  const track = user.videoTrack as IRemoteVideoTrack | null
                  if (node && track) track.play(node)
                }}
                autoPlay
                className="w-full h-full object-cover"
              />
              <audio
                ref={(node) => {
                  const audioTrack = user.audioTrack as IRemoteAudioTrack | null
                  if (node && audioTrack) audioTrack.play()
                }}
                autoPlay
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default VideoStage
