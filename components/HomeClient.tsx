"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AuthBox from "./AuthBox";
import DirectoryRoomCard, { DirectoryRoom } from "./DirectoryRoomCard";
import { fetchMe } from "../lib/authClient";

const PER_PAGE = 20;
const PROMO_MAX = 5;

export default function HomeClient() {
  const [toast, setToast] = useState<string | null>(null);
  const [me, setMe] = useState<{ username: string } | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [rooms, setRooms] = useState<DirectoryRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [bucket, setBucket] = useState<number>(() =>
    Math.floor(Date.now() / (5 * 60 * 1000))
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMe().then((u) => setMe(u ? { username: u.username } : null));
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setBucket(Math.floor(Date.now() / (5 * 60 * 1000))),
      5 * 60 * 1000
    );
    return () => clearInterval(id);
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      setRoomsLoading(true);
      const res = await fetch("/api/directory/rooms?cb=" + Date.now(), {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list: DirectoryRoom[] = Array.isArray(json) ? json : json.rooms || [];
      setRooms(list);
    } catch {
      console.warn("Failed to load directory rooms.");
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
    const id = setInterval(loadRooms, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [loadRooms]);

  const promotedRooms = rooms
    .filter((r: any) => r?.promoted || r?.isPromoted || r?.featured)
    .slice(0, PROMO_MAX);
  const publicRooms = rooms.filter(
    (r: any) => !(r?.promoted || r?.isPromoted || r?.featured)
  );

  const pageCount = Math.max(1, Math.ceil(publicRooms.length / PER_PAGE));
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  const start = (page - 1) * PER_PAGE;
  const visibleRooms = publicRooms.slice(start, start + PER_PAGE);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      window.location.href = "/";
    }
  };

  const goToMyRoom = () => {
    if (!me?.username) {
      setToast("Please log in or register first.");
      const authBox = document.querySelector("#auth-box");
      if (authBox) authBox.scrollIntoView({ behavior: "smooth" });
      return;
    }
    window.location.href = `/room/${encodeURIComponent(me.username)}`;
  };

  const pageItems = useMemo(() => {
    const items: (number | "gap")[] = [];
    const add = (n: number) => {
      if (n >= 1 && n <= pageCount && !items.includes(n)) items.push(n);
    };
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) add(i);
    } else {
      add(1); add(2); add(page - 1); add(page); add(page + 1);
      add(pageCount - 1); add(pageCount);
      const sorted = items
        .filter((x): x is number => typeof x === "number")
        .sort((a, b) => a - b);
      const withGaps: (number | "gap")[] = [];
      for (let i = 0; i < sorted.length; i++) {
        withGaps.push(sorted[i]);
        if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) withGaps.push("gap");
      }
      return withGaps;
    }
    return items;
  }, [page, pageCount]);

  return (
    <>
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar__inner">
          <a className="brand" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ezchat-logo.png" alt="EZChat.Cam logo" className="brand__logo" />
            <span className="brand__name">EZChat.Cam</span>
            <span className="brand__tag">webcam chat</span>
          </a>

          <div style={{ marginLeft: "auto" }} ref={menuRef}>
            {me ? (
              <div className="user-menu">
                <button
                  className="user-menu__btn"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  {me.username}
                  <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" style={{ marginLeft: 6 }}>
                    <path fill="currentColor" d="M5 7l5 6 5-6z" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="user-menu__list" role="menu">
                    <button className="user-menu__item" onClick={goToMyRoom} role="menuitem">
                      My Room
                    </button>
                    <a href="/settings" className="user-menu__item" role="menuitem">
                      Settings
                    </a>
                    <button className="user-menu__item" onClick={logout} role="menuitem">
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 16, paddingBottom: 24 }}>
        {!me && (
          <div id="auth-box">
            <AuthBox
              onSuccess={() => {
                fetchMe().then((u) => setMe(u ? { username: u.username } : null));
                loadRooms();
              }}
            />
          </div>
        )}

        {/* Promoted */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
          <h2>Promoted Rooms</h2>
          <button
            className="button button--secondary"
            onClick={() => (window.location.href = "/promote")}
            title="Promote your room"
          >
            🎺 Promote
          </button>
        </div>

        {promotedRooms.length === 0 ? (
          <div
            className="card"
            style={{
              marginTop: 12,
              padding: 12,
              textAlign: "center",
              background: "linear-gradient(180deg, rgba(120,20,20,.35), rgba(120,20,20,.15))",
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <span style={{ opacity: 0.85 }}>
              No promoted rooms yet. <a href="/promote" className="link">Promote</a> yours to appear here.
            </span>
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            {promotedRooms.map((room) => (
              <DirectoryRoomCard key={`promo-${room.name}`} room={room} bucket={bucket} />
            ))}
          </div>
        )}

        {/* Active */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
          <h2>Active Chatrooms</h2>
          <button
            className="button button--secondary"
            onClick={() => { loadRooms(); setPage(1); }}
            disabled={roomsLoading}
          >
            {roomsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {rooms.length === 0 ? (
          <p style={{ opacity: 0.7 }}>{roomsLoading ? "Loading rooms..." : "No active rooms."}</p>
        ) : (
          <>
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gridAutoRows: "1fr",
                gap: 14,
              }}
            >
              {visibleRooms.map((room) => (
                <DirectoryRoomCard key={room.name} room={room} bucket={bucket} />
              ))}
            </div>

            {pageCount > 1 && (
              <nav
                aria-label="Directory pagination"
                className="pager"
                style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 8 }}
              >
                {pageItems.map((item, idx) =>
                  item === "gap" ? (
                    <span key={`gap-${idx}`} style={{ opacity: 0.5, padding: "6px 10px" }}>…</span>
                  ) : (
                    <button
                      key={item}
                      className="pager__btn"
                      onClick={() => setPage(item)}
                      aria-current={item === page ? "page" : undefined}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 4,
                        background: item === page ? "#2688ff" : "transparent",
                        color: item === page ? "#fff" : "inherit",
                        border: "1px solid rgba(255,255,255,.08)",
                        minWidth: 34,
                      }}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  className="pager__btn"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page >= pageCount}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 4,
                    border: "1px solid rgba(255,255,255,.08)",
                    opacity: page >= pageCount ? 0.5 : 1,
                  }}
                  title="Next page"
                >
                  »
                </button>
              </nav>
            )}
          </>
        )}

        {toast && <div style={{ marginTop: 10, opacity: 0.75 }}>{toast}</div>}
      </main>

      <footer
        style={{
          marginTop: 40,
          padding: "12px 0",
          textAlign: "center",
          fontSize: 13,
          color: "#ccc",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ marginBottom: 4 }}>
          <a href="/" style={{ color: "#ccc", margin: "0 6px" }}>Home</a>|
          <span style={{ color: "#666", margin: "0 6px", cursor: "not-allowed" }}>Donate</span>|
          <a href="/privacy" style={{ color: "#ccc", margin: "0 6px" }}>Privacy Policy</a>|
          <a href="/terms" style={{ color: "#ccc", margin: "0 6px" }}>Terms Of Service</a>
        </div>
        <div>Copyright © {new Date().getFullYear()} EZChat.Cam. All Rights Reserved.</div>
      </footer>
    </>
  );
}
