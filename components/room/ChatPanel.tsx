// File: components/ChatPanel.tsx

'use client'

import React, { useMemo, useRef, useState } from 'react'

type Msg = { id: string; user: string; text: string; ts: number }

export default function ChatPanel({
  me,
  className,
}: {
  me: string
  className?: string
}) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const send = () => {
    const t = text.trim()
    if (!t) return
    setMsgs(m => [...m, { id: crypto.randomUUID(), user: me, text: t, ts: Date.now() }])
    setText('')
    setTimeout(() => listRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }), 0)
  }

  const header = useMemo(
    () => (
      <div className="px-3 py-2 border-b border-white/10">
        <h3 className="text-white/80 font-bold tracking-wide">CHAT</h3>
      </div>
    ),
    []
  )

  return (
    <aside
      className={`
        rounded-2xl bg-black/25 ring-1 ring-white/10 flex flex-col
        w-full h-full ${className || ''}
      `}
    >
      {header}
      <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2">
        {msgs.length === 0 ? (
          <p className="text-white/40 text-sm">No messages yet. Say hi!</p>
        ) : (
          msgs.map(m => (
            <div key={m.id} className="text-sm">
              <span className="text-white/60 mr-1">{m.user.toUpperCase()}:</span>
              <span className="text-white/90 break-words">{m.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-white/10 flex items-center gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-lg bg-black/40 ring-1 ring-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-white/20"
        />
        <button
          onClick={send}
          className="px-3 py-2 rounded-lg bg-white text-black font-semibold hover:opacity-90"
        >
          Send
        </button>
      </div>
    </aside>
  )
}
