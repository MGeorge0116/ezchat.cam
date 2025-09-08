"use client";

import * as React from "react";

export interface BroadcastControlsProps {
  /** Whether the local user is currently broadcasting (camera/mic active). */
  isBroadcasting: boolean;
  /** Start broadcasting (should acquire getUserMedia, create local tile, etc.). */
  onStart: () => void | Promise<void>;
  /** Stop broadcasting (stop tracks, remove local tile). */
  onStop: () => void | Promise<void>;
  /** Whether the local microphone is muted. */
  micMuted: boolean;
  /** Toggle local microphone mute/unmute. */
  onToggleMic: () => void | Promise<void>;
  /** Whether the user has “deafened” (mutes all page media). */
  deafened: boolean;
  /** Toggle deafen/undeafen (mute/unmute *all* page media). */
  onToggleDeafen: () => void | Promise<void>;
  /** Optional extra class names for container. */
  className?: string;
  /** Disable all buttons (e.g., while starting/stopping). */
  disabled?: boolean;
}

export default function BroadcastControls({
  isBroadcasting,
  onStart,
  onStop,
  micMuted,
  onToggleMic,
  deafened,
  onToggleDeafen,
  className,
  disabled,
}: BroadcastControlsProps) {
  const start = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      if (!disabled) void onStart();
    },
    [onStart, disabled]
  );

  const stop = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      if (!disabled) void onStop();
    },
    [onStop, disabled]
  );

  const toggleMic = React.useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    (e) => {
      e.preventDefault();
      if (!disabled) void onToggleMic();
    },
    [onToggleMic, disabled]
  );

  const toggleDeafen = React.useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    (e) => {
      e.preventDefault();
      if (!disabled) void onToggleDeafen();
    },
    [onToggleDeafen, disabled]
  );

  return (
    <div
      className={`flex items-center justify-center gap-3 px-3 py-2 ${
        className ?? ""
      }`}
    >
      {/* Start / Stop toggle — single primary control */}
      {isBroadcasting ? (
        <button
          type="button"
          onClick={stop}
          disabled={disabled}
          className="rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition
                     bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Stop Broadcasting"
        >
          Stop Broadcasting
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={disabled}
          className="rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition
                     bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Start Broadcasting"
        >
          Start Broadcasting
        </button>
      )}

      {/* Mic toggle */}
      <button
        type="button"
        onClick={toggleMic}
        disabled={disabled || !isBroadcasting}
        className="rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition
                   bg-neutral-700 hover:bg-neutral-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        aria-pressed={micMuted}
        aria-label={micMuted ? "Unmute microphone" : "Mute microphone"}
        title={micMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {micMuted ? "Unmute Mic" : "Mute Mic"}
      </button>

      {/* Deafen toggle */}
      <button
        type="button"
        onClick={toggleDeafen}
        disabled={disabled}
        className="rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm transition
                   bg-neutral-700 hover:bg-neutral-800 text-white disabled:opacity-60 disabled:cursor-not-allowed"
        aria-pressed={deafened}
        aria-label={deafened ? "Undeafen (restore sound)" : "Deafen (mute all)"}
        title={deafened ? "Undeafen" : "Deafen"}
      >
        {deafened ? "Undeafen" : "Deafen"}
      </button>
    </div>
  );
}
