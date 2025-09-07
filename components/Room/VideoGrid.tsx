// components/room/VideoGrid.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BroadcastControls from "./BroadcastControls";
import { useBroadcastState } from "./hooks";

type Props = { room: string };

type Tile = {
  id: string;
  label: string;            // username label (usually uppercased in UI)
  isLocal: boolean;
  muted: boolean;
  stream?: MediaStream;
  volume?: number;          // 0..1 (remote tiles only)
};

export default function VideoGrid({ room }: Props) {
  const { isLive } = useBroadcastState(room);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // keep individual <video> refs by tile id
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const setVideoRef = (id: string) => (el: HTMLVideoElement | null) => {
    videoRefs.current[id] = el;
  };

  // Expanded view <video> ref
  const expandedRef = useRef<HTMLVideoElement | null>(null);

  // Handle add/remove/mute events from BroadcastControls (local tile for now)
  useEffect(() => {
    function onAdd(e: Event) {
      const ce = e as CustomEvent<Tile>;
      const detail = ce.detail;
      setTiles((prev) => {
        const exists = prev.some((t) => t.id === detail.id);
        const init: Tile = {
          ...detail,
          // local preview volume is always 0 (muted)
          volume: detail.isLocal ? 0 : 1,
        };
        return exists ? prev.map((t) => (t.id === detail.id ? { ...t, ...init } : t)) : [...prev, init];
      });
    }
    function onRemove(e: Event) {
      const ce = e as CustomEvent<{ id: string }>;
      setTiles((prev) => prev.filter((t) => t.id !== ce.detail.id));
      setMenuFor((m) => (m === ce.detail.id ? null : m));
      setExpandedId((x) => (x === ce.detail.id ? null : x));
    }
    function onUpdateMute(e: Event) {
      const ce = e as CustomEvent<{ id: string; muted: boolean }>;
      setTiles((prev) => prev.map((t) => (t.id === ce.detail.id ? { ...t, muted: ce.detail.muted } : t)));
    }

    window.addEventListener("ezchat:add-tile" as any, onAdd as any);
    window.addEventListener("ezchat:remove-tile" as any, onRemove as any);
    window.addEventListener("ezchat:update-mute" as any, onUpdateMute as any);
    return () => {
      window.removeEventListener("ezchat:add-tile" as any, onAdd as any);
      window.removeEventListener("ezchat:remove-tile" as any, onRemove as any);
      window.removeEventListener("ezchat:update-mute" as any, onUpdateMute as any);
    };
  }, []);

  // Wire streams <-> video elements + volumes
  useEffect(() => {
    tiles.forEach((tile) => {
      const el = videoRefs.current[tile.id];
      if (!el) return;

      if (tile.stream) {
        try {
          // set stream each render if changed
          if (el.srcObject !== tile.stream) el.srcObject = tile.stream;
          // local preview is always muted
          el.muted = tile.isLocal ? true : false;
          // volume only meaningful for non-muted, remote tiles
          if (!tile.isLocal) {
            const vol = clamp01(tile.volume ?? 1);
            if (el.volume !== vol) el.volume = vol;
          }
          // play best-effort
          el.play().catch(() => {});
        } catch {
          // ignore
        }
      } else {
        try {
          el.pause();
        } catch {}
        (el as any).srcObject = null;
      }
    });

    // Expanded view mirror
    if (expandedId) {
      const tile = tiles.find((t) => t.id === expandedId);
      if (expandedRef.current) {
        if (tile?.stream) {
          if (expandedRef.current.srcObject !== tile.stream) {
            expandedRef.current.srcObject = tile.stream;
          }
          expandedRef.current.muted = tile.isLocal ? true : false;
          if (!tile.isLocal) {
            expandedRef.current.volume = clamp01(tile.volume ?? 1);
          }
          expandedRef.current.play().catch(() => {});
        } else {
          try {
            expandedRef.current.pause();
          } catch {}
          (expandedRef.current as any).srcObject = null;
        }
      }
    }
  }, [tiles, expandedId]);

  // Close menus on outside click / escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuFor(null);
        setExpandedId(null);
      }
    }
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // if clicking outside any tile-menu, close it
      if (!target.closest?.("[data-tile-menu]") && !target.closest?.("[data-tile]")) {
        setMenuFor(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const gridCols = useMemo(() => {
    const n = tiles.length;
    if (n <= 2) return "grid-cols-2";
    if (n <= 4) return "grid-cols-2";
    if (n <= 9) return "grid-cols-3";
    return "grid-cols-4";
  }, [tiles.length]);

  return (
    <div className="h-full w-full border border-white/10 rounded-2xl p-3 bg-white/5 relative">
      {/* Grid of tiles */}
      <div className={`grid ${gridCols} gap-3 place-items-center h-full`}>
        {tiles.map((tile) => (
          <div
            key={tile.id}
            data-tile
            className="relative w-full max-w-[92%] aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center"
            onClick={(e) => {
              // open menu for this tile
              setMenuFor((m) => (m === tile.id ? null : tile.id));
              e.stopPropagation();
            }}
          >
            {/* Video or placeholder */}
            {tile.stream ? (
              <video ref={setVideoRef(tile.id)} className="w-full h-full object-contain" playsInline />
            ) : tile.isLocal ? (
              <video ref={setVideoRef(tile.id)} className="w-full h-full object-contain" playsInline />
            ) : (
              <div className="text-white/50 text-sm">REMOTE VIDEO</div>
            )}

            {/* Name overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs tracking-wide pointer-events-none">
              {tile.label?.toUpperCase?.() || "UNKNOWN"}
              {tile.muted && <span className="ml-2 opacity-80">• MIC MUTED</span>}
            </div>

            {/* Tile menu (click to open) */}
            {menuFor === tile.id && (
              <TileMenu
                tile={tile}
                onClose={() => setMenuFor(null)}
                onExpand={() => {
                  setExpandedId(tile.id);
                  setMenuFor(null);
                }}
                onVolume={(v) => {
                  setTiles((prev) => prev.map((t) => (t.id === tile.id ? { ...t, volume: v } : t)));
                  const el = videoRefs.current[tile.id];
                  if (el && !tile.isLocal) el.volume = clamp01(v);
                }}
                onViewProfile={() => {
                  // Route to the user's room as a "profile" view surrogate
                  const uname = (tile.label || "").toString().trim().toLowerCase();
                  if (uname) window.location.href = `/room/${uname}`;
                }}
              />
            )}
          </div>
        ))}

        {/* Empty state */}
        {tiles.length === 0 && (
          <div className="col-span-full text-center text-white/60 text-sm py-10">
            {isLive
              ? "Starting video… If you don't see yourself, check camera permissions."
              : "Click Start Broadcasting to go live."}
          </div>
        )}
      </div>

      {/* Controls overlay — bottom-center INSIDE the video section */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-3">
        <BroadcastControls room={room} />
      </div>

      {/* Expanded view overlay */}
      {expandedId && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setExpandedId(null)}
        >
          <div
            className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video ref={expandedRef} className="w-full h-full object-contain" playsInline />
            <button
              className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm"
              onClick={() => setExpandedId(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Helpers & Subcomponents ===================== */

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function TileMenu({
  tile,
  onClose,
  onExpand,
  onVolume,
  onViewProfile,
}: {
  tile: Tile;
  onClose: () => void;
  onExpand: () => void;
  onVolume: (v: number) => void;
  onViewProfile: () => void;
}) {
  // For local preview, keep slider disabled (always muted)
  const sliderDisabled = tile.isLocal;

  return (
    <div
      data-tile-menu
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-[min(92%,520px)] rounded-2xl border border-white/10 bg-white/10 p-4 text-white space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            {tile.label?.toUpperCase?.() || "UNKNOWN"}
          </div>
          <button
            className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <button
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-left"
            onClick={onViewProfile}
          >
            View Profile
          </button>

          <div className="px-3 py-2 rounded-xl bg-white/10">
            <div className="text-xs mb-2 opacity-80">Volume</div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              disabled={sliderDisabled}
              value={Math.round(clamp01(tile.volume ?? (tile.isLocal ? 0 : 1)) * 100)}
              onChange={(e) => onVolume(Number(e.target.value) / 100)}
              className={`w-full ${sliderDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              title={sliderDisabled ? "Local preview is muted" : "Adjust volume"}
            />
          </div>

          <button
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-left"
            onClick={onExpand}
          >
            Expand Webcam
          </button>
        </div>
      </div>
    </div>
  );
}
