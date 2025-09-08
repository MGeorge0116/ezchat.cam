"use client";

import * as React from "react";
import BroadcastToggle from "@/components/BroadcastToggle";

export interface BroadcastPanelProps {
  isBroadcasting: boolean;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  micMuted: boolean;
  onToggleMic: () => void | Promise<void>;
  deafened: boolean;
  onToggleDeafen: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function BroadcastPanel({
  isBroadcasting,
  onStart,
  onStop,
  micMuted,
  onToggleMic,
  deafened,
  onToggleDeafen,
  disabled,
  className,
}: BroadcastPanelProps) {
  const handleMicClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      if (!disabled) void onToggleMic();
    },
    [onToggleMic, disabled]
  );

  const handleDeafenClick = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      if (!disabled) void onToggleDeafen();
    },
    [onToggleDeafen, disabled]
  );

  return (
    <div
      className={`flex w-full items-center justify-center gap-3 px-3 py-2 ${
        className ?? ""
      }`}
    >
      <BroadcastToggle
        isBroadcasting={isBroadcasting}
        onStart={onStart}
        onStop={onStop}
        disabled={disabled}
      />

      <button
        type="button"
        onClick={handleMicClick}
        disabled={disabled || !isBroadcasting}
        className="rounded-2xl bg-neutral-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        aria-pressed={micMuted}
        aria-label={micMuted ? "Unmute microphone" : "Mute microphone"}
        title={micMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {micMuted ? "Unmute Mic" : "Mute Mic"}
      </button>

      <button
        type="button"
        onClick={handleDeafenClick}
        disabled={disabled}
        className="rounded-2xl bg-neutral-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        aria-pressed={deafened}
        aria-label={deafened ? "Undeafen (restore sound)" : "Deafen (mute all)"}
        title={deafened ? "Undeafen" : "Deafen"}
      >
        {deafened ? "Undeafen" : "Deafen"}
      </button>
    </div>
  );
}
