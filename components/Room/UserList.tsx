// components/Room/UserList.tsx
"use client"

import { useEffect, useState } from "react"

async function fetchPresence(room: string): Promise<string[]> {
  const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

export default function UserList({ room, joined }: { room: string; joined: boolean }) {
  const [users, setUsers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!joined) {
      setUsers([])
      setLoading(false)
      return
    }
    let active = true
    let interval: ReturnType<typeof setInterval> | null = null

    const load = async () => {
      try {
        const list = await fetchPresence(room)
        if (!active) return
        setUsers(list)
        setError(null)
      } catch (e: any) {
        if (!active) return
        setError(e?.message ?? "Failed to load presence")
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
  }, [room, joined])

  return (
    <div className="p-3 space-y-2">
      {loading && <div className="text-xs opacity-70">Loading…</div>}
      {error && <div className="text-xs text-yellow-500">{error}</div>}
      {!loading && users.map((u) => (
        <div key={u} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/25 border">
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
            {u.charAt(0).toUpperCase()}
          </div>
          <div className="text-sm">{u}</div>
        </div>
      ))}
    </div>
  )
}
