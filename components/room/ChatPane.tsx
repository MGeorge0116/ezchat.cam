// components/Room/ChatPane.tsx
"use client"

import { useEffect, useRef, useState } from "react"

type Message = { id: string; username: string; text: string; createdAt: string }

async function fetchMessages(room: string): Promise<Message[]> {
  const res = await fetch(`/api/chat/list?room=${encodeURIComponent(room)}`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

async function postMessage(room: string, text: string) {
  await fetch("/api/chat/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room, text }),
  })
}

export default function ChatPane({ room }: { room: string }) {
  const [text, setText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let active = true
    let interval: ReturnType<typeof setInterval> | null = null

    const load = async () => {
      try {
        const msgs = await fetchMessages(room)
        if (!active) return
        setMessages(msgs)
        setError(null)
      } catch (e: any) {
        if (!active) return
        setError(e?.message ?? "Failed to load messages")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    interval = setInterval(load, 5000)
    return () => {
      active = false
      if (interval) clearInterval(interval)
    }
  }, [room])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setText("")
    try {
      await postMessage(room, trimmed)
      const msgs = await fetchMessages(room)
      setMessages(msgs)
      setError(null)
    } catch (e: any) {
      setError(e?.message ?? "Failed to send")
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading && <div className="text-xs opacity-70">Say hello to others in the room.</div>}
        {error && <div className="text-xs text-yellow-500">{error}</div>}
        {!loading && messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className="font-semibold">{m.username}:</span> {m.text}
          </div>
        ))}
      </div>

      <div className="p-2 border-t flex items-center gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-lg bg-transparent focus:outline-none"
          placeholder="Type message here"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} className="px-3 py-2 rounded bg-blue-600 text-white">
          Send
        </button>
      </div>
    </div>
  )
}
