"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Message = { id: string; from: "you" | "other" | "system"; text: string; ts: number };

export default function ChatPane({ room }: { room: string }) {
  const [text, setText] = useState("");
  const [msgs] = useState<Message[]>([
    { id: "sys", from: "system", text: "Say hello to others in the room.", ts: Date.now() },
  ]);

  // Light/Dark aware tokens—subtle to match your screenshot
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const apply = () => setIsDark(!!mq?.matches);
    apply();
    mq?.addEventListener?.("change", apply);
    return () => mq?.removeEventListener?.("change", apply);
  }, []);

  const ui = useMemo(
    () =>
      isDark
        ? {
            panelBg: "transparent",
            panelBorder: "rgba(255,255,255,0.14)",
            msgMuted: "rgba(255,255,255,0.75)",
            inputBg: "rgba(255,255,255,0.06)",
            inputBorder: "rgba(255,255,255,0.14)",
            placeholder: "rgba(255,255,255,0.55)",
            sendBg: "#0284c7",
          }
        : {
            panelBg: "transparent",
            panelBorder: "rgba(0,0,0,0.14)",
            msgMuted: "rgba(0,0,0,0.70)",
            inputBg: "rgba(0,0,0,0.04)",
            inputBorder: "rgba(0,0,0,0.16)",
            placeholder: "rgba(0,0,0,0.55)",
            sendBg: "#0284c7",
          },
    [isDark]
  );

  // Reserved for future autoscroll
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    // Wire up to your chat backend here if needed
    setText("");
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className="flex h-full flex-col rounded-md"
      style={{ backgroundColor: ui.panelBg, border: `1px solid ${ui.panelBorder}` }}
      aria-label="Room chat"
    >
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 pt-3">
        {msgs.map((m) =>
          m.from === "system" ? (
            <div key={m.id} className="text-sm" style={{ color: ui.msgMuted }}>
              {m.text}
            </div>
          ) : null
        )}
      </div>

      {/* Bottom composer — single line input + small blue Send button */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type message here"
            className="chatInput h-9 flex-1 rounded-md px-3 outline-none"
            style={{ color: "inherit" }}
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className={`h-9 rounded-md px-3 text-sm font-semibold text-white shadow ${
              text.trim() ? "" : "opacity-50 cursor-not-allowed"
            }`}
            style={{ backgroundColor: ui.sendBg }}
          >
            Send
          </button>
        </div>
      </div>

      {/* Styled-JSX to handle placeholder + input colors */}
      <style jsx>{`
        .chatInput {
          background-color: ${ui.inputBg};
          border: 1px solid ${ui.inputBorder};
        }
        .chatInput::placeholder {
          color: ${ui.placeholder};
        }
      `}</style>
    </div>
  );
}
