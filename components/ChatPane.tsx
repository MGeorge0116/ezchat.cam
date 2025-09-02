// components/ChatPane.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRtmChannel, getRtmClient, rtmAvailable } from "../lib/agora";

type Message = { text: string; senderId: string; ts: number };

export default function ChatPane({
  channelName,
  localUid,
}: {
  channelName: string;
  localUid: string;
}) {
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const addMsg = useCallback((m: Message) => {
    setMessages((prev) => [...prev, m]);
  }, []);

  // subscribe to RTM channel events (if available)
  useEffect(() => {
    if (!rtmAvailable()) {
      setReady(false);
      return;
    }

    const chan = getRtmChannel();
    const client = getRtmClient();

    if (!chan || !client) {
      setReady(false);
      return;
    }

    const onMsg = (msg: any, senderId: string) => {
      const text = typeof msg?.text === "string" ? msg.text : JSON.stringify(msg);
      addMsg({ text, senderId, ts: Date.now() });
    };

    chan.on("ChannelMessage", onMsg);
    setReady(true);

    return () => {
      try { chan.off("ChannelMessage", onMsg); } catch {}
    };
  }, [addMsg]);

  // auto scroll
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    if (!rtmAvailable() || !getRtmChannel()) return;

    try {
      await getRtmChannel().sendMessage({ text: t });
      addMsg({ text: t, senderId: localUid || "me", ts: Date.now() });
      setText("");
    } catch {
      addMsg({ text: "(failed to send)", senderId: "system", ts: Date.now() });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send();
  };

  return (
    <div className="chatpane">
      <div className="chatpane__title">Chat</div>

      {!rtmAvailable() && (
        <div className="muted" style={{ padding: "6px 8px" }}>
          Channel chat isn’t available right now.
        </div>
      )}

      <div ref={scrollerRef} className="chatpane__scroll">
        {messages.length === 0 ? (
          <div className="muted">Say hello to others in the room.</div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="chatmsg">
              <span className="chatmsg__who">
                {m.senderId === localUid ? "You" : m.senderId}
              </span>
              <span className="chatmsg__text">{m.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="chatpane__input">
        <input
          className="input"
          placeholder={rtmAvailable() ? "Type message here" : "Chat unavailable"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          disabled={!rtmAvailable()}
        />
        <button className="button button--primary" onClick={send} disabled={!rtmAvailable()}>
          Send
        </button>
      </div>
    </div>
  );
}
