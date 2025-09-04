// components/ChatPanel.tsx
"use client";

import { useEffect, useRef, useState, FormEvent, KeyboardEvent } from "react";

type ChatMessage = {
  id: string;
  author: string;   // already ALL CAPS in your UI
  text: string;
  ts?: number;
};

export default function ChatPanel(props: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  className?: string; // optional extra classes from parent
}) {
  const { messages, onSend, className } = props;
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const val = text.trim();
    if (!val) return;
    onSend(val);
    setText("");
    inputRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
    }
  }

  return (
    <section
      id="chatPanel"
      className={`flex h-full min-h-0 flex-col ${className ?? ""}`}
      aria-label="Chat panel"
    >
      {/* Scrollable messages area */}
      <div
        id="chatList"
        role="log"
        aria-live="polite"
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2"
      >
        {messages.map(m => (
          <article
            key={m.id}
            className="rounded-xl bg-white/5 px-3 py-2"
            aria-label={`Message from ${m.author}`}
          >
            <div className="text-[11px] tracking-wide opacity-70">{m.author}</div>
            <div className="text-sm leading-relaxed">{m.text}</div>
          </article>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input row pinned to bottom */}
      <form
        id="inputRow"
        onSubmit={handleSubmit}
        className="sticky bottom-0 border-t border-white/10 bg-[rgb(12,18,27)/0.85] backdrop-blur px-3 py-2"
        aria-label="Send a message"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            autoComplete="off"
            aria-label="Message input"
            className="flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2 outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium hover:border-white/40 active:translate-y-[0.5px]"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
