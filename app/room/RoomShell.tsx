// components/room/RoomShell.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import UserList from './UserList';
import ChatPanel from './ChatPanel';
import { VideoGrid } from './VideoGrid';
import type { Participant } from './VideoGrid';
import ControlsBar from './ControlsBar';
import DeviceSelectors, { MediaDeviceInfoLite } from './DeviceSelectors';

type LocalState = {
  stream: MediaStream | null;
  camOn: boolean;
  micOn: boolean;
  live: boolean;
  error: string | null;
};

export default function RoomShell({
  roomName,
  currentUser,
}: {
  roomName: string;
  currentUser?: string;
}) {
  const meName = (currentUser ?? 'You').toUpperCase();

  // storage keys derived from prop
  const { metaKey, pubKey, avatarKey } = useMemo(() => {
    const lower = roomName.toLowerCase();
    return {
      metaKey: `room:meta:${lower}`,
      pubKey: `room:desc:pub:${lower}`,
      avatarKey: `profile:avatar:${lower}`,
    };
  }, [roomName]);

  const readAvatar = useCallback(() => {
    try { return typeof window !== 'undefined' ? localStorage.getItem(avatarKey) || null : null; }
    catch { return null; }
  }, [avatarKey]);

  const readDesc = useCallback(() => {
    try { return typeof window !== 'undefined' ? (localStorage.getItem(pubKey) || '').slice(0, 30) : ''; }
    catch { return ''; }
  }, [pubKey]);

  const [pubDesc, setPubDesc] = useState('');
  useEffect(() => { setPubDesc(readDesc()); }, [readDesc]);

  const [local, setLocal] = useState<LocalState>({
    stream: null, camOn: true, micOn: true, live: false, error: null,
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const localRef = useRef<MediaStream | null>(null);

  // device lists
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfoLite[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfoLite[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);

  const enumerate = useCallback(async () => {
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      const cams = list.filter((d) => d.kind === 'videoinput');
      const mics = list.filter((d) => d.kind === 'audioinput');
      setVideoDevices(cams.map(({ deviceId, kind, label }) => ({ deviceId, kind, label })));
      setAudioDevices(mics.map(({ deviceId, kind, label }) => ({ deviceId, kind, label })));

      const curV = localRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
      const curA = localRef.current?.getAudioTracks()[0]?.getSettings().deviceId;
      setSelectedVideoId(curV ?? cams[0]?.deviceId ?? null);
      setSelectedAudioId(curA ?? mics[0]?.deviceId ?? null);
    } catch {}
  }, []);

  // heartbeat writer for directory
  const hbRef = useRef<number | null>(null);
  const writeMeta = useCallback((isLive: boolean) => {
    try {
      const meta = {
        username: roomName,
        isLive,
        promoted: false,
        watching: 0,
        avatarDataUrl: readAvatar(),
        description: readDesc(),
        lastSeen: Date.now(),
      };
      localStorage.setItem(metaKey, JSON.stringify(meta));
    } catch {}
  }, [metaKey, readAvatar, readDesc, roomName]);

  const clearHeartbeat = useCallback(() => {
    if (hbRef.current) {
      window.clearInterval(hbRef.current);
      hbRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      s.getVideoTracks().forEach((t) => (t.enabled = true));
      s.getAudioTracks().forEach((t) => (t.enabled = true));
      localRef.current = s;

      const me: Participant = { id: 'local', name: meName, stream: s, camOn: true, micOn: true };
      setParticipants((prev) => [me, ...prev.filter((p) => p.id !== 'local')]);
      setLocal({ stream: s, camOn: true, micOn: true, live: true, error: null });

      writeMeta(true);
      clearHeartbeat();
      hbRef.current = window.setInterval(() => writeMeta(true), 5000);

      await enumerate();
    } catch (e: any) {
      setLocal((l) => ({ ...l, error: e?.message || 'Permission denied', live: false }));
      localRef.current = null;
      clearHeartbeat();
      writeMeta(false);
    }
  }, [enumerate, meName, writeMeta, clearHeartbeat]);

  const stop = useCallback(() => {
    const s = localRef.current;
    if (s) for (const tr of s.getTracks()) { try { tr.stop(); } catch {} }
    localRef.current = null;
    setParticipants((prev) => prev.filter((p) => p.id !== 'local'));
    setLocal({ stream: null, camOn: false, micOn: false, live: false, error: null });

    clearHeartbeat();
    writeMeta(false);
  }, [clearHeartbeat, writeMeta]);

  useEffect(() => () => { clearHeartbeat(); writeMeta(false); }, [clearHeartbeat, writeMeta]);

  const replaceVideoTrack = useCallback(async (deviceId: string) => {
    if (!localRef.current) return;
    try {
      const ns = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }, audio: false,
      });
      const vt = ns.getVideoTracks()[0];
      localRef.current.getVideoTracks()[0]?.stop();
      const merged = new MediaStream([...localRef.current.getAudioTracks(), vt]);
      localRef.current = merged;
      setParticipants((prev) =>
        prev.map((p) => (p.id === 'local' ? { ...p, stream: merged } : p))
      );
      setLocal((l) => ({ ...l, stream: merged }));
      setSelectedVideoId(deviceId);
    } catch {}
  }, []);

  const replaceAudioTrack = useCallback(async (deviceId: string) => {
    if (!localRef.current) return;
    try {
      const ns = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } }, video: false,
      });
      const at = ns.getAudioTracks()[0];
      localRef.current.getAudioTracks()[0]?.stop();
      const merged = new MediaStream([...localRef.current.getVideoTracks(), at]);
      localRef.current = merged;
      setParticipants((prev) =>
        prev.map((p) => (p.id === 'local' ? { ...p, stream: merged } : p))
      );
      setLocal((l) => ({ ...l, stream: merged }));
      setSelectedAudioId(deviceId);
    } catch {}
  }, []);

  const toggleCam = useCallback(() => {
    setLocal((l) => {
      const next = !l.camOn;
      localRef.current?.getVideoTracks().forEach((t) => (t.enabled = next));
      setParticipants((prev) => prev.map((p) => (p.id === 'local' ? { ...p, camOn: next } : p)));
      return { ...l, camOn: next };
    });
  }, []);

  const toggleMic = useCallback(() => {
    setLocal((l) => {
      const next = !l.micOn;
      localRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
      setParticipants((prev) => prev.map((p) => (p.id === 'local' ? { ...p, micOn: next } : p)));
      return { ...l, micOn: next };
    });
  }, []);

  const users = useMemo(() => {
    const uniq = new Map<string, string>();
    if (currentUser) uniq.set(currentUser.toLowerCase(), currentUser);
    for (const p of participants) uniq.set(p.name.toLowerCase(), p.name);
    return Array.from(uniq.values());
  }, [currentUser, participants]);

  return (
    <div className="flex flex-col flex-1">
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="grid grid-cols-[260px_minmax(0,1fr)_360px] gap-4 px-4 min-h-[calc(100dvh-4rem)] items-stretch">
          {/* LEFT: Users */}
          <UserList users={users} currentUser={currentUser} />

          {/* CENTER: description + video grid + controls */}
          <div className="flex flex-col h-full">
            {pubDesc && (
              <div className="mb-2 text-xs text-white/70">{pubDesc}</div>
            )}

            <div className="rounded-2xl bg-black/20 ring-1 ring-white/10 p-4 flex flex-col h-full min-h-0">
              {local.live && (
                <DeviceSelectors
                  videoDevices={videoDevices}
                  audioDevices={audioDevices}
                  selectedVideoId={selectedVideoId}
                  selectedAudioId={selectedAudioId}
                  onChangeVideo={replaceVideoTrack}
                  onChangeAudio={replaceAudioTrack}
                />
              )}

              <div className="flex-1 min-h-0 flex flex-col">
                <VideoGrid participants={participants} />
              </div>

              <ControlsBar
                live={local.live}
                camOn={local.camOn}
                micOn={local.micOn}
                error={local.error}
                onStart={start}
                onStop={stop}
                onToggleCam={toggleCam}
                onToggleMic={toggleMic}
              />
            </div>
          </div>

          {/* RIGHT: Chat */}
          <ChatPanel me={currentUser ?? 'You'} />
        </div>
      </div>
    </div>
  );
}
