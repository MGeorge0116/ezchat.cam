"use client";

import * as React from "react";

export interface BroadcastToggleProps {
  isBroadcasting: boolean;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
}

export default function BroadcastToggle({
  isBroadcasting,
  onStart,
  onStop,
  disabled,
  className,
}: BroadcastToggleProps) {
  const handleStart = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      if (!disabled) void onStart();
    },
    [onStart, disabled]
  );

  const handleStop = React.useCallback<React.MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();
      if (!disabled) void onStop();
    },
    [onStop, disabled]
  );

  return isBroadcasting ? (
    <button
      type="button"
      onClick={handleStop}
      disabled={disabled}
      className={`rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
      aria-label="Stop Broadcasting"
    >
      Stop Broadcasting
    </button>
  ) : (
    <button
      type="button"
      onClick={handleStart}
      disabled={disabled}
      className={`rounded-2xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
      aria-label="Start Broadcasting"
    >
      Start Broadcasting
    </button>
  );
}
