'use client';

export default function ControlsBar({
  live,
  camOn,
  micOn,
  error,
  onStart,
  onStop,
  onToggleCam,
  onToggleMic,
}: {
  live: boolean;
  camOn: boolean;
  micOn: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onToggleCam: () => void;
  onToggleMic: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {!live ? (
        <button
          onClick={onStart}
          className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-semibold"
        >
          Start Broadcasting
        </button>
      ) : (
        <button
          onClick={onStop}
          className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 font-semibold"
        >
          Stop Broadcasting
        </button>
      )}

      <button
        onClick={onToggleCam}
        disabled={!live}
        className="rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-2 disabled:opacity-50"
      >
        {camOn ? 'Camera Off' : 'Camera On'}
      </button>

      <button
        onClick={onToggleMic}
        disabled={!live}
        className="rounded-lg bg-white/10 hover:bg-white/20 text-white px-3 py-2 disabled:opacity-50"
      >
        {micOn ? 'Mute Microphone' : 'Unmute Microphone'}
      </button>

      {error && <div className="ml-3 text-rose-400 text-sm">{error}</div>}
    </div>
  );
}
