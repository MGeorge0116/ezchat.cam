// components/UserList.tsx
"use client";

import { useMemo, useState } from "react";

type Member = {
  uid: string;
  name?: string;
  isYou?: boolean;
  micOn?: boolean;
  camOn?: boolean;
};

export default function UserList({
  members,
  youId,
}: {
  members: Member[];
  youId?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      // you first, then by uid
      if (a.uid === youId) return -1;
      if (b.uid === youId) return 1;
      return a.uid.localeCompare(b.uid);
    });
  }, [members, youId]);

  return (
    <div className="userlist card" style={{ padding: 10 }}>
      <div className="userlist__title">Users</div>
      <div className="userlist__scroll">
        {sorted.length === 0 ? (
          <div className="muted" style={{ padding: 8 }}>No one here yet.</div>
        ) : (
          sorted.map((m) => {
            const isActive = active === m.uid;
            return (
              <button
                key={m.uid}
                className="userlist__item"
                onClick={() => setActive((s) => (s === m.uid ? null : m.uid))}
                aria-pressed={isActive}
                title={m.isYou ? "You" : `User ${m.uid}`}
              >
                <div className="userlist__avatar" aria-hidden />
                <div className="userlist__meta">
                  <div className="userlist__name">
                    {m.name || (m.isYou ? "You" : m.uid)}
                    {m.isYou && <span className="badge">you</span>}
                  </div>
                  <div className="userlist__badges">
                    <span className={`pill ${m.micOn ? "pill--on" : "pill--off"}`}>Mic</span>
                    <span className={`pill ${m.camOn ? "pill--on" : "pill--off"}`}>Cam</span>
                  </div>
                </div>

                {/* Small inline “actions” when active */}
                {isActive && (
                  <div className="userlist__actions">
                    <button className="mini-btn" title="(example) Whisper">
                      💬
                    </button>
                    <button className="mini-btn" title="(example) View">
                      👁️
                    </button>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
