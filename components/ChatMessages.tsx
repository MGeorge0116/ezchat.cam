"use client";

import { useEffect, useRef, useState } from "react";

type Props = { room: string };
type Msg = { id?: string | number; text?: string; message?: string; username?: string; user?: string; createdAt?: string };

export default function ChatMessages({ room }: Props) {
  const [items, setItems] = useState<Msg[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let timer: any;

    const tick = async () => {
      try {
        const res = await fetch(`/api/chat/list?room=${encodeURIComponent(room)}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const list: Msg[] = data?.messages ?? data ?? [];
          setItems(Array.isArray(list) ? list : []);
        }
      } catch {}
      timer = setTimeout(tick, 3000);
    };

    tick();
    return () => clearTimeout(timer);
  }, [room]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length]);

  if (!items.length) return <div className="opacity-60 text-sm">No messages yet.</div>;

  return (
    <div className="space-y-2 text-sm">
      {items.map((m, i) => (
        <div key={m.id ?? i} className="break-words">
          <span className="opacity-60 mr-2">{m.username || m.user || "User"}:</span>
          <span>{m.text ?? m.message ?? ""}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
