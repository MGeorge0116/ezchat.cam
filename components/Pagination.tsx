// File: components/Pagination.tsx

'use client'

import Link from 'next/link'
import React from 'react'

export default function Pagination({
  currentPage,
  totalPages,
  basePath = '/',
}: { currentPage: number; totalPages: number; basePath?: string }) {
  if (totalPages <= 1) return null

  const pageHref = (p: number) => {
    const sp = new URLSearchParams()
    if (p > 1) sp.set('page', String(p)) // keep page=1 clean
    const q = sp.toString()
    return q ? `${basePath}?${q}` : basePath
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const windowed = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)

  const items: Array<number | '…'> = []
  for (let i = 0; i < windowed.length; i++) {
    items.push(windowed[i])
    if (i < windowed.length - 1 && windowed[i + 1] - windowed[i] > 1) items.push('…')
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Pagination">
      <Link
        aria-label="Previous page"
        className={`px-3 py-1.5 rounded-lg ring-1 ring-white/10 ${currentPage === 1 ? 'text-white/30 pointer-events-none' : 'text-white hover:bg-white/5'}`}
        href={pageHref(Math.max(1, currentPage - 1))}
      >
        Prev
      </Link>

      {items.map((it, idx) =>
        it === '…' ? (
          <span key={`e-${idx}`} className="px-2 text-white/40">…</span>
        ) : (
          <Link
            key={it}
            href={pageHref(it)}
            aria-current={currentPage === it ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg ring-1 ring-white/10 ${currentPage === it ? 'bg-white text-black' : 'text-white hover:bg-white/5'}`}
          >
            {it}
          </Link>
        )
      )}

      <Link
        aria-label="Next page"
        className={`px-3 py-1.5 rounded-lg ring-1 ring-white/10 ${currentPage === totalPages ? 'text-white/30 pointer-events-none' : 'text-white hover:bg-white/5'}`}
        href={pageHref(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </Link>
    </nav>
  )
}
