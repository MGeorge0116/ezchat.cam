"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/** ---------- Config ---------- */
const MAX_CAM_SLOTS = 12; // maximum number of concurrent cameras per room

/** ---------- Types ---------- */
type UserLite = { id: string; username: string; email?: string; mic?: boolean; cam?: boolean };
type ChatMsg = { id: string; user: string; text: string; ts: number };

/** ---------- Helpers ---------- */
async function safeGet<T = any>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}
async function safePost<T = any>(url: string, body: any): Promise<T | null> {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

/** Optional room creation + heartbeat (no-op if endpoints not present) */
async function ensureRoom(slug: string) {
  await safePost("/api/rooms/ensure", { slug }).catch(() => null);
}
function startHeartbeat(slug: string) {
  return setInterval(() => {
    safePost("/api/rooms/heartbeat", { slug }).catch(() => null);
  }, 15000);
}

/** ---------- Page ---------- */
export default function RoomPage() {
  const { room } = useParams<{ room: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const meName =
    (session?.user as any)?.username ||
    session?.user?.name ||
    (session?.user?.email ? session.user.email.split("@")[0] : "You");
  const meEmail = session?.user?.email;

  /** state */
  const [participants, setParticipants] = React.useState<UserLite[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMsg[]>([]);
  const [draft, setDraft] = React.useState("");
  const [micOn, setMicOn] = React.useState(true);
  const [camOn, setCamOn] = React.useState(false); // my local camera intent

  /** once: ensure room + heartbeat */
  React.useEffect(() => {
    const slug = String(room);
    ensureRoom(slug);
    const t = startHeartbeat(slug);
    return () => clearInterval(t);
  }, [room]);

  /** presence & chat polling (API with graceful fallback) */
  React.useEffect(() => {
    let cancelled = false;

    async function loadPresence() {
      const api = await safeGet<any>(`/api/presence/list?room=${encodeURIComponent(String(room))}`);
      if (!cancelled) {
        if (api && Array.isArray(api)) {
          setParticipants(
            api.map((u: any) => ({
              id: String(u.id ?? u.username ?? u.email ?? crypto.randomUUID()),
              username: String(u.username ?? u.name ?? u.email ?? "guest"),
              email: typeof u.email === "string" ? u.email : undefined,
              mic: Boolean(u.mic ?? true),
              cam: Boolean(u.cam ?? false),
            }))
          );
        } else {
          // fallback mock: just me
          setParticipants([
            { id: "me", username: meName, email: meEmail ?? undefined, mic: micOn, cam: camOn },
          ]);
        }
      }
    }

    async function loadChat() {
      const api = await safeGet<any>(`/api/chat/list?room=${encodeURIComponent(String(room))}`);
      if (!cancelled && api && Array.isArray(api)) {
        setMessages(
          api.map((m: any) => ({
            id: String(m.id ?? crypto.randomUUID()),
            user: String(m.user?.username ?? m.user?.name ?? m.username ?? "user"),
            text: String(m.text ?? m.message ?? ""),
            ts: Number(new Date(m.createdAt ?? m.ts ?? Date.now()).getTime()),
          }))
        );
      }
    }

    loadPresence();
    loadChat();
    const p1 = setInterval(loadPresence, 3000);
    const p2 = setInterval(loadChat, 2000);
    return () => {
      cancelled = true;
      clearInterval(p1);
      clearInterval(p2);
    };
  }, [room, meName, meEmail, micOn, camOn]);

  /** presence update helper (no-op if you don't have the endpoint) */
  async function updatePresenceCam(next: boolean) {
    setCamOn(next); // local first for snappy UI
    await safePost("/api/presence/update", { room, cam: next }).catch(() => null);
  }

  /** identify me in the list */
  const meIdGuess = React.useMemo(() => {
    const byEmail = participants.find((p) => meEmail && p.email && p.email === meEmail)?.id;
    if (byEmail) return byEmail;
    const byName = participants.find((p) => p.username === meName)?.id;
    return byName ?? "me";
  }, [participants, meEmail, meName]);

  /** merge my local cam state into the participant list so UI reflects instantly */
  const withMeApplied = React.useMemo(() => {
    return participants.map((p) => (p.id === meIdGuess ? { ...p, cam: camOn } : p));
  }, [participants, meIdGuess, camOn]);

  /** broadcasters = users with cam:true (after applying my local state) */
  const broadcasters = React.useMemo(
    () => withMeApplied.filter((p) => p.cam),
    [withMeApplied]
  );

  /** first MAX_CAM_SLOTS broadcasters get camera slots */
  const allowedBroadcasters = new Set(
    broadcasters.slice(0, MAX_CAM_SLOTS).map((p) => p.id)
  );
  const camSlotsUsed = Math.min(broadcasters.length, MAX_CAM_SLOTS);
  const camSlotsFull = camSlotsUsed >= MAX_CAM_SLOTS;

  /** am I currently occupying a slot? */
  const iAmBroadcasting = camOn && allowedBroadcasters.has(meIdGuess);

  /** if I turned camera on but later lost a slot (edge), turn off locally */
  React.useEffect(() => {
    if (camOn && !iAmBroadcasting) {
      setCamOn(false);
    }
  }, [camOn, iAmBroadcasting]);

  /** order list: me first, then others */
  const ordered = React.useMemo(() => {
    const mine = withMeApplied.filter((p) => p.id === meIdGuess);
    const rest = withMeApplied.filter((p) => p.id !== meIdGuess);
    return [...mine, ...rest];
  }, [withMeApplied, meIdGuess]);

  /** ------- Active tile (only broadcasters) ------- */
  const broadcasting = ordered.filter(
    (p) => p.cam && allowedBroadcasters.has(p.id)
  );
  const primary = broadcasting.some((p) => p.id === activeId)
    ? (activeId as string)
    : broadcasting[0]?.id ?? null;
  const active = broadcasting.find((p) => p.id === primary) ?? null;

  /** chat send */
  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    const mine: ChatMsg = { id: crypto.randomUUID(), user: meName, text, ts: Date.now() };
    setMessages((m) => [...m, mine]);
    setDraft("");
    await safePost(`/api/chat/post`, { room, text });
  }

  /** toggle camera respecting capacity */
  function toggleCamera() {
    if (!camOn) {
      if (camSlotsUsed < MAX_CAM_SLOTS) {
        updatePresenceCam(true);
      }
    } else {
      updatePresenceCam(false);
      setActiveId((id) => (id === meIdGuess ? null : id)); // clear stage if it was me
    }
  }

  /** explicit stop broadcasting from tile */
  function stopBroadcasting() {
    if (camOn) {
      updatePresenceCam(false);
      setActiveId((id) => (id === meIdGuess ? null : id)); // clear stage if it was me
    }
  }

  return (
    <div className="room-root">
      {/* Left: Participants */}
      <aside className="left">
        <div className="panel-title">Participants</div>
        <div className="userlist">
          {ordered.map((u) => {
            const isMe = u.id === meIdGuess || u.username === meName;
            const hasSlot = allowedBroadcasters.has(u.id);
            return (
              <button
                key={u.id}
                onClick={() => setActiveId(u.id)}
                className={`userrow ${u.id === primary ? "active" : ""}`}
                title={u.email || u.username}
              >
                <div className={`avatar ${u.cam && hasSlot ? "cam" : ""}`}>
                  {u.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="uname">{isMe ? `${u.username} (You)` : u.username}</div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Center: Video stage */}
      <section className="center">
        <div className="stage">
          {camSlotsFull && !iAmBroadcasting && (
            <div className="capacity-banner">
              Camera slots full ({MAX_CAM_SLOTS}/{MAX_CAM_SLOTS}). You’re in chat-only mode.
            </div>
          )}

          {active ? (
            <div className="tile">
              <div className="video-placeholder">
                <div className="obs-circle" />
              </div>
              <div className="tile-footer">
                <span className="badge">
                  {active.id === meIdGuess || active.username === meName
                    ? `${active.username} (You)`
                    : active.username}
                </span>

                {(active.id === meIdGuess || active.username === meName) && iAmBroadcasting && (
                  <button
                    className="stop-cast"
                    onClick={stopBroadcasting}
                    title="Stop broadcasting (free your slot)"
                  >
                    Stop Broadcasting
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-center">No video.</div>
          )}
        </div>
      </section>

      {/* Right: Chat */}
      <aside className="right">
        <div className="panel-title">Chat</div>
        <div className="chatlog" id="chatlog">
          {messages.length === 0 ? (
            <div className="chat-empty">Say hello to others in the room.</div>
          ) : (
            messages
              .slice()
              .sort((a, b) => a.ts - b.ts)
              .map((m) => (
                <div key={m.id} className="msg">
                  <span className="who">{m.user}</span>
                  <span className="text">{m.text}</span>
                </div>
              ))
          )}
        </div>
        <div className="chatbox">
          <input
            className="chat-input"
            placeholder="Type message here"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button className="send" onClick={sendMessage}>Send</button>
        </div>
      </aside>

      {/* Bottom controls (renamed camera button) */}
      <div className="controls">
        <button className={`btn ${micOn ? "" : "off"}`} onClick={() => setMicOn((s) => !s)}>
          {micOn ? "Mic On" : "Mic Off"}
        </button>

        <button
          className={`btn ${camOn ? "" : "off"}`}
          onClick={toggleCamera}
          disabled={!camOn && camSlotsFull}
          title={
            !camOn && camSlotsFull
              ? `All ${MAX_CAM_SLOTS} camera slots are currently in use.`
              : undefined
          }
        >
          {camOn ? "Stop Broadcasting" : "Start Broadcasting"}
        </button>

        <button className="btn leave" onClick={() => router.push("/")}>Leave</button>
      </div>

      {/* Styles */}
      <style jsx>{`
        .room-root {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          height: calc(100vh - 56px - 64px); /* header & footer */
          display: grid;
          grid-template-columns: 260px 1fr 380px;
          grid-template-rows: 1fr auto;
          gap: 0;
          color: var(--text);
        }
        .left { border-right: 1px solid var(--edge); overflow: hidden; display: flex; flex-direction: column; }
        .center { border-right: 1px solid var(--edge); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .right { display: grid; grid-template-rows: auto 1fr auto; overflow: hidden; }
        .panel-title { font-weight: 700; padding: 10px 12px; border-bottom: 1px solid var(--edge); }

        .userlist { padding: 8px; overflow: auto; }
        .userrow { width: 100%; background: transparent; border: 1px solid var(--edge); border-radius: 10px; padding: 8px;
          display: grid; grid-template-columns: 36px 1fr; gap: 8px; align-items: center; color: var(--text); cursor: pointer; margin-bottom: 8px; }
        .userrow:hover { background: var(--panel); }
        .userrow.active { box-shadow: inset 0 0 0 2px #4b5563; }

        .avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
          background: #111827; color: #f3f4f6; font-weight: 700; border: 1px solid var(--edge); }
        .avatar.cam { background: #0b3d91; }

        .uname { font-size: 14px; }

        .stage { width: 100%; height: 100%; display: grid; place-items: start center; padding: 16px; overflow: auto; position: relative; }
        .capacity-banner {
          position: absolute; top: 12px; left: 50%; transform: translateX(-50%);
          background: #1f2937; color: #e5e7eb; border: 1px solid var(--edge);
          padding: 6px 10px; border-radius: 8px; font-size: 12px; z-index: 2;
        }
        .tile { width: 360px; height: 200px; border-radius: 8px; background: #111827; border: 1px solid var(--edge); position: relative; overflow: hidden; }
        .video-placeholder { position: absolute; inset: 0; background: linear-gradient(15deg, #0b1730 50%, #182a63 50%); display: grid; place-items: center; }
        .obs-circle { width: 88px; height: 88px; border-radius: 50%; border: 6px solid #fff; box-shadow: 0 0 0 8px rgba(255,255,255,.1) inset;
          background: radial-gradient(circle at 50% 35%, #000 22%, transparent 23%),
                      radial-gradient(circle at 35% 60%, #000 22%, transparent 23%),
                      radial-gradient(circle at 65% 60%, #000 22%, transparent 23%), #fff; }
        .tile-footer { position: absolute; left: 8px; right: 8px; bottom: 8px; display: flex; align-items: center; gap: 10px; }
        .badge { background: #111827; border: 1px solid var(--edge); color: #e5e7eb; border-radius: 6px; padding: 4px 8px; font-size: 12px; font-weight: 600; }
        .stop-cast {
          margin-left: 8px;
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #7f1d1d;
          background: #991b1b;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .stop-cast:hover { background: #7f1d1d; }
        .empty-center { color: var(--muted); }

        .chatlog { overflow: auto; padding: 12px; border-bottom: 1px solid var(--edge); }
        .chat-empty { color: var(--muted); }
        .msg { margin-bottom: 8px; }
        .who { font-weight: 700; margin-right: 6px; }
        .text { color: var(--text); }

        .chatbox { display: grid; grid-template-columns: 1fr auto; gap: 8px; padding: 10px; align-items: center; }
        .chat-input { padding: 10px; border-radius: 8px; background: var(--panel); color: var(--text); border: 1px solid var(--edge); }
        .send { padding: 10px 14px; border-radius: 8px; border: 1px solid var(--btn-edge); background: var(--btn); color: var(--text); font-weight: 600; cursor: pointer; }
        .send:hover { background: var(--btn-hover); }

        .controls { grid-column: 1 / 4; display: flex; justify-content: center; gap: 16px; padding: 14px 0 8px; border-top: 1px solid var(--edge);
          position: sticky; bottom: 0; background: var(--bg); }
        .btn { padding: 10px 14px; border-radius: 10px; font-weight: 700; border: 1px solid var(--btn-edge); background: var(--btn);
          color: var(--text); cursor: pointer; min-width: 170px; } /* little wider for the new label */
        .btn.off { background: #1f2937; }
        .btn.leave { background: #b91c1c; border-color: #7f1d1d; color: #fff; }
      `}</style>
    </div>
  );
}
