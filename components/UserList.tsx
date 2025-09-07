// File: components/UserList.tsx

'use client'

import React from 'react'

export default function UserList({
  users,
  currentUser,
  className,
}: {
  users: string[]
  currentUser: string
  className?: string
}) {
  const caps = (s: string) => s.toUpperCase()
  return (
    <aside
      className={`
        rounded-2xl bg-black/25 ring-1 ring-white/10 p-3
        w-full h-full overflow-auto ${className || ''}
      `}
    >
      <h3 className="text-white/80 font-bold tracking-wide mb-2">USERS</h3>
      <ul className="space-y-1">
        {users.map(u => {
          const me = u === currentUser
          return (
            <li
              key={u}
              className={`
                flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg
                ${me ? 'bg-green-600/20 ring-1 ring-green-500/30' : 'hover:bg-white/5'}
                text-sm
              `}
            >
              <span className={`truncate ${me ? 'text-green-300' : 'text-white/90'}`}>
                {caps(u)}
              </span>
              {me && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-600/30 text-green-200">
                  YOU
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
