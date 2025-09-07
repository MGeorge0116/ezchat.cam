// components/home/RoomCard.tsx
'use client';

import Link from 'next/link';

export type RoomMeta = {
  username: string;
  isLive: boolean;
  promoted?: boolean;
  watching?: number;
  avatarDataUrl?: string; // profile avatar from My Profile
  title?: string;
  description?: string;
  lastSeen?: number;       // heartbeat timestamp
};

export default function RoomCard({ meta }: { meta: RoomMeta }) {
  const href = `/room/${encodeURIComponent(meta.username)}`;
  const thumb = meta.avatarDataUrl || '/default-avatar.svg';

  return (
    <Link
      href={href}
      className="group rounded-2xl ring-1 ring-white/10 bg-gradient-to-b from-white/[0.03] to-transparent hover:ring-white/20 transition"
    >
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-black/30 flex items-center justify-center">
        <img
          src={thumb}
          alt={`${meta.username}'s room`}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="text-white/90 font-semibold truncate">
            {(meta.title || meta.username).toUpperCase()}
          </div>
          {meta.isLive && (
            <span className="ml-2 text-[10px] px-2 py-1 rounded-md bg-red-600/80 text-white font-bold">
              LIVE
            </span>
          )}
        </div>

        <div className="mt-1 text-xs text-white/60 truncate">@{meta.username}</div>

        {meta.description && (
          <div className="mt-2 text-xs text-white/70 line-clamp-2">{meta.description}</div>
        )}
      </div>
    </Link>
  );
}
