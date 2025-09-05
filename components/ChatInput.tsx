"use client";

import { useState } from "react";

type Props = { room: string; username: string };

export default function ChatInput({ room, username }: Props) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/chat/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // NOTE: send the room identifier as `roomId`
        body: JSON.stringify({ roomId: room, text: value, username }),
      });
      setValue("");
    } catch {
      // no-op (you can add a toast or error UI here)
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message..."
        className="h-10 flex-1 rounded-xl border border-white/15 bg-transparent px-3"
      />
      <button
        type="submit"
        disabled={sending || !value.trim()}
        className="h-10 rounded-xl border border-white/20 px-4 text-sm font-semibold hover:border-white/40 active:translate-y-[0.5px]"
      >
        Send
      </button>
    </form>
  );
}
