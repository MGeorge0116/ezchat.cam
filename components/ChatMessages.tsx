"use client";

import * as React from "react";

export type ChatItem = {
  id: string;
  username: string;
  text: string;
  createdAt?: number; // epoch ms optional
};

export interface ChatMessagesProps {
  messages: ChatItem[];
  className?: string;
  /** Auto-scroll to bottom when new messages arrive (default true) */
  autoScroll?: boolean;
}

export default function ChatMessages({
  messages,
  className,
  autoScroll = true,
}: ChatMessagesProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const lastCountRef = React.useRef<number>(messages.length);

  React.useEffect(() => {
    if (!autoScroll) return;
    if (messages.length > lastCountRef.current) {
      // New message(s) arrived
      const el = containerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
    lastCountRef.current = messages.length;
  }, [messages, autoScroll]);

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto rounded-xl border border-neutral-800 p-2 ${className ?? ""}`}
      aria-label="Chat messages"
    >
      {messages.length === 0 ? (
        <p className="py-6 text-center text-sm opacity-70">No messages yet.</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => (
            <li key={m.id} className="rounded-lg bg-neutral-900/70 p-2">
              <div className="mb-1 text-xs font-semibold tracking-wide opacity-80">
                {m.username.toUpperCase()}
                {typeof m.createdAt === "number" && (
                  <span className="ml-2 font-normal opacity-60">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="whitespace-pre-wrap text-sm">{m.text}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
