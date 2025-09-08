"use client";

import { useEffect, useState } from "react";

/* ========= Broadcast State ========= */

type BroadcastState = {
  isLive: boolean;
  micMuted: boolean;
  deafened: boolean;
  stream: MediaStream | null;
  selectedMicId?: string | null;
  selectedCamId?: string | null;
};

const DEFAULT: BroadcastState = {
  isLive: false,
  micMuted: false,
  deafened: false,
  stream: null,
  selectedMicId: null,
  selectedCamId: null,
};

const stateByRoom = new Map<string, BroadcastState>();
function ensureRoomState(room: string): BroadcastState {
  if (!stateByRoom.has(room)) stateByRoom.set(room, { ...DEFAULT });
  return stateByRoom.get(room)!;
}

export function useBroadcastState(room: string) {
  ensureRoomState(room);
  const [, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((x) => x + 1);
    window.addEventListener(`ezchat:broadcast:${room}`, on);
    return () => window.removeEventListener(`ezchat:broadcast:${room}`, on);
  }, [room]);
  return ensureRoomState(room);
}
function emit(room: string) { window.dispatchEvent(new Event(`ezchat:broadcast:${room}`)); }

export function useBroadcastActions(room: string) {
  const st = ensureRoomState(room);

  async function start() {
    if (st.isLive && st.stream) return st.stream;
    const constraints: MediaStreamConstraints = {
      video: st.selectedCamId ? { deviceId: { exact: st.selectedCamId } } : true,
      audio: st.selectedMicId ? { deviceId: { exact: st.selectedMicId } } : true,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    st.isLive = true; st.micMuted = false; st.stream = stream;
    heartbeat(room, true); emit(room); return stream;
  }
  function stop() {
    if (st.stream) st.stream.getTracks().forEach((t) => t.stop());
    st.isLive = false; st.micMuted = false; st.stream = null;
    heartbeat(room, false); emit(room);
  }
  function toggleMic() {
    if (!st.stream) return st.micMuted;
    st.micMuted = !st.micMuted;
    st.stream.getAudioTracks().forEach((t) => (t.enabled = !st.micMuted));
    emit(room); return st.micMuted;
  }
  function toggleDeafen() {
    st.deafened = !st.deafened;
    const media = Array.from(document.querySelectorAll("video,audio")) as HTMLMediaElement[];
    media.forEach((m) => (m.muted = st.deafened || m.muted));
    emit(room);
  }
  async function setMicDevice(deviceId: string) {
    st.selectedMicId = deviceId || null;
    if (!st.isLive) return emit(room);
    const s2 = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true, video: false });
    const newTrack = s2.getAudioTracks()[0]; const old = st.stream?.getAudioTracks()[0];
    if (old) { st.stream!.removeTrack(old); old.stop(); } if (newTrack) st.stream!.addTrack(newTrack); emit(room);
  }
  async function setCamDevice(deviceId: string) {
    st.selectedCamId = deviceId || null;
    if (!st.isLive) return emit(room);
    const s2 = await navigator.mediaDevices.getUserMedia({ video: deviceId ? { deviceId: { exact: deviceId } } : true, audio: false });
    const newTrack = s2.getVideoTracks()[0]; const old = st.stream?.getVideoTracks()[0];
    if (old) { st.stream!.removeTrack(old); old.stop(); } if (newTrack) st.stream!.addTrack(newTrack); emit(room);
  }

  return { start, stop, toggleMic, toggleDeafen, setMicDevice, setCamDevice };
}

/* ========= Directory & Presence heartbeat ========= */

export function useRoomHeartbeat(room: string) {
  useEffect(() => {
    let cancelled = false;

    async function writeMeta(isLive: boolean) {
      const username =
        localStorage.getItem("auth:username") ||
        localStorage.getItem("profile:username") ||
        localStorage.getItem("ui:username") ||
        room;

      // read presence list to compute counts
      let watching = 0;
      let broadcasters = 0;
      try {
        const res = await fetch(`/api/presence/list?room=${encodeURIComponent(room)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const users = Array.isArray(data?.users) ? data.users : [];
          watching = users.length;
          broadcasters = Math.min(12, users.filter((u: any) => !!u.isLive).length);
        }
      } catch {}

      const meta = {
        username,
        isLive,
        promoted: localStorage.getItem(`room:meta:${username}:promoted`) === "1",
        watching,
        broadcasters,
        avatarDataUrl: localStorage.getItem(`profile:avatar:${username}`) || "",
        description: localStorage.getItem(`profile:desc:${username}`) || "",
        lastSeen: Date.now(),
      };
      if (!cancelled) {
        try { localStorage.setItem(`room:meta:${username}`, JSON.stringify(meta)); } catch {}
      }
    }

    // initial write
    writeMeta(false);

    const id = setInterval(() => {
      writeMeta(ensureRoomState(room).isLive);
      presenceHeartbeat(room, ensureRoomState(room).isLive);
    }, 5000);

    return () => { cancelled = true; clearInterval(id); };
  }, [room]);
}

function presenceHeartbeat(room: string, isLive?: boolean) {
  const username =
    localStorage.getItem("auth:username") ||
    localStorage.getItem("profile:username") ||
    localStorage.getItem("ui:username") ||
    "anon";
  fetch("/api/rooms/heartbeat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ room, username, isLive: !!isLive }),
  }).catch(() => {});
}
function heartbeat(room: string, isLive: boolean) {
  try {
    const username =
      localStorage.getItem("auth:username") ||
      localStorage.getItem("profile:username") ||
      localStorage.getItem("ui:username") ||
      room;
    const metaRaw = localStorage.getItem(`room:meta:${username}`);
    const meta = metaRaw ? JSON.parse(metaRaw) : {};
    meta.isLive = isLive; meta.lastSeen = Date.now();
    localStorage.setItem(`room:meta:${username}`, JSON.stringify(meta));
  } catch {}
  presenceHeartbeat(room, isLive);
}
