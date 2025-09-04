"use client";

import { useEffect, useRef } from "react";

/* ----------------------- utilities ----------------------- */

function findButtonByLabels(labels: string[]): HTMLButtonElement | null {
  const btns = Array.from(document.querySelectorAll("button")) as HTMLButtonElement[];
  const lowers = labels.map((s) => s.toLowerCase());
  return (
    btns.find((b) => lowers.some((l) => ((b.textContent || "").trim().toLowerCase()).startsWith(l))) ||
    null
  );
}

function setRed(btn: HTMLElement) {
  btn.classList.remove("bg-emerald-600/90", "hover:bg-emerald-500", "bg-white/10", "hover:bg-white/20");
  btn.classList.add("bg-red-600", "hover:bg-red-500");
}
function setGreen(btn: HTMLElement) {
  btn.classList.remove("bg-red-600", "hover:bg-red-500", "bg-white/10", "hover:bg-white/20");
  btn.classList.add("bg-emerald-600/90", "hover:bg-emerald-500");
}
function hide(el?: HTMLElement | null, yes = true) {
  if (!el) return;
  el.classList.toggle("hidden", !!yes);
}

const MIC_MUTED_SVG =
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
     <path d="M12 3a3 3 0 0 0-3 3v3"/>
     <path d="M15 10V6a3 3 0 0 0-1.76-2.73"/>
     <path d="M19 10a7 7 0 0 1-11.2 5.6"/>
     <path d="M12 17v4"/>
     <path d="M3 21L21 3"/>
   </svg>`;

/* ----------------------- component ----------------------- */

export default function RoomControlsAgent() {
  const streamRef = useRef<MediaStream | null>(null);
  const selectedCameraId = useRef<string | undefined>(undefined);
  const selectedMicId = useRef<string | undefined>(undefined);

  const videoEnabled = useRef<boolean>(true);
  const audioEnabled = useRef<boolean>(true);

  const usernameRef = useRef<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!/^\/room\//.test(window.location.pathname)) return;

    // Username (ALL CAPS) from /room/[username]
    try {
      const parts = window.location.pathname.split("/");
      usernameRef.current = (decodeURIComponent(parts[2] || "") || "Guest").toUpperCase();
    } catch {
      usernameRef.current = "GUEST";
    }

    let cleanupFns: Array<() => void> = [];
    let btnBroadcast: HTMLButtonElement | null = null;
    let btnCam: HTMLButtonElement | null = null;
    let btnMic: HTMLButtonElement | null = null;

    /* ---------- tile/grid styles & helpers ---------- */

    function tileBaseStyle(): Partial<CSSStyleDeclaration> {
      return {
        position: "relative",
        flex: "1 1 30%",
        minWidth: "240px",
        maxWidth: "980px",              // cap camera tile width
        aspectRatio: "16/9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",               // center the tile
        background: "transparent",
        borderRadius: "12px",
        overflow: "hidden",
      };
    }
    function tileExpandedStyle(selected: boolean): Partial<CSSStyleDeclaration> {
      return selected
        ? { flex: "1 1 70%", minWidth: "520px" }
        : { flex: "1 1 14%", minWidth: "160px" };
    }
    function overlayStyle(): Partial<CSSStyleDeclaration> {
      return {
        position: "absolute",
        left: "50%",
        bottom: "8px",
        transform: "translateX(-50%)",
        padding: "6px 10px",
        borderRadius: "10px",
        background: "rgba(0,0,0,0.6)",  // black translucent background
        color: "#fff",                   // white text
        fontSize: "12px",
        lineHeight: "1",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap",
        opacity: "1",                   // always visible
        pointerEvents: "none",
      };
    }
    function menuStyleHidden(): Partial<CSSStyleDeclaration> {
      return {
        position: "absolute",
        right: "10px",
        top: "10px",
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        padding: "8px",
        borderRadius: "10px",
        display: "none",
        flexDirection: "column",
        gap: "6px",
        zIndex: "5",
      };
    }

    const ensureGrid = (host: HTMLElement) => {
      let grid = host.querySelector<HTMLDivElement>("#ezcam-grid");
      if (!grid) {
        grid = document.createElement("div");
        grid.id = "ezcam-grid";
        Object.assign(grid.style, {
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignContent: "flex-start",
          justifyContent: "center",     // center tiles; avoid over-stretch
          width: "100%",
          height: "100%",
        });
        host.innerHTML = "";
        host.appendChild(grid);
      }
      return grid;
    };

    const getGrid = () => document.querySelector("#ezcam-grid") as HTMLDivElement | null;
    const getAllTiles = () =>
      Array.from((getGrid() || document.createElement("div")).querySelectorAll(".ezcam-tile")) as HTMLDivElement[];

    function showMenu(tile: HTMLElement) {
      const m = tile.querySelector<HTMLDivElement>("#ezcam-menu");
      if (!m) return;
      m.style.display = "flex";
      const expandBtn = m.querySelector<HTMLButtonElement>("#ezcam-menu-expand");
      if (expandBtn) expandBtn.textContent = tile.getAttribute("data-expanded") === "true" ? "Exit Expand" : "Expand Screen";
    }
    function hideMenu(tile: HTMLElement) {
      const m = tile.querySelector<HTMLDivElement>("#ezcam-menu");
      if (!m) return;
      m.style.display = "none";
    }
    function toggleMenu(tile: HTMLElement) {
      const m = tile.querySelector<HTMLDivElement>("#ezcam-menu");
      if (!m) return;
      m.style.display = m.style.display === "flex" ? "none" : "flex";
    }

    function expandTile(tile: HTMLDivElement) {
      const grid = getGrid();
      if (!grid) return;
      getAllTiles().forEach((t) => {
        const selected = t === tile;
        Object.assign(t.style, tileExpandedStyle(selected));
        t.dataset.expanded = selected ? "true" : "false";
      });
      grid.setAttribute("data-has-expanded", "true");
    }
    function collapseAllTiles() {
      const grid = getGrid();
      if (!grid) return;
      getAllTiles().forEach((t) => {
        Object.assign(t.style, tileBaseStyle());
        t.dataset.expanded = "false";
        const m = t.querySelector<HTMLButtonElement>("#ezcam-menu-expand");
        if (m) m.textContent = "Expand Screen";
      });
      grid.removeAttribute("data-has-expanded");
    }
    function resetDefaultLayout() {
      collapseAllTiles(); // default = not expanded
    }

    // Overlay update (always show username; add mic icon/label when muted)
    const renderOverlay = (tile?: HTMLElement | null) => {
      const target = (tile || document.querySelector("#ezcam-tile-local")) as HTMLElement | null;
      if (!target) return;
      const overlay = target.querySelector<HTMLDivElement>("#ezcam-overlay");
      if (!overlay) return;
      const icon = overlay.querySelector<HTMLSpanElement>("#ezcam-mic-icon")!;
      const name = overlay.querySelector<HTMLSpanElement>("#ezcam-name")!;
      const status = overlay.querySelector<HTMLSpanElement>("#ezcam-status")!;

      name.textContent = usernameRef.current;

      if (audioEnabled.current) {
        icon.innerHTML = "";
        icon.style.display = "none";
        status.style.display = "none";
      } else {
        icon.innerHTML = MIC_MUTED_SVG;
        icon.style.display = "inline-flex";
        status.style.display = "inline";
        status.textContent = "Mic Muted";
      }
    };

    /* ---------- create tile & grid ---------- */

    const ensureLocalTile = (grid: HTMLElement) => {
      let tile = grid.querySelector<HTMLDivElement>("#ezcam-tile-local");
      if (!tile) {
        tile = document.createElement("div");
        tile.id = "ezcam-tile-local";
        tile.className = "ezcam-tile";
        Object.assign(tile.style, tileBaseStyle());
        tile.dataset.expanded = "false"; // default

        grid.appendChild(tile);

        // video (proportional, fully visible, zoomed out a bit)
        const video = document.createElement("video");
        video.id = "ezcam-local-video";
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        Object.assign(video.style, {
          width: "auto",
          height: "auto",
          maxWidth: "88%",              // zoom out a touch
          maxHeight: "50vh",            // and cap vertical size
          objectFit: "contain",         // show entire frame; no crop
          borderRadius: "12px",
          backgroundColor: "transparent",
          display: "block",
        });
        tile.appendChild(video);

        // overlay (always visible at bottom)
        const overlay = document.createElement("div");
        overlay.id = "ezcam-overlay";
        overlay.innerHTML = `
          <span id="ezcam-mic-icon" style="display:none;vertical-align:middle;"></span>
          <span id="ezcam-name" style="vertical-align:middle;"></span>
          <span id="ezcam-status" style="vertical-align:middle;display:none;"></span>
        `;
        Object.assign(overlay.style, overlayStyle());
        tile.appendChild(overlay);

        // in-tile menu
        const menu = document.createElement("div");
        menu.id = "ezcam-menu";
        menu.innerHTML = `
          <button id="ezcam-menu-profile" style="padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.08)">View Profile</button>
          <button id="ezcam-menu-expand" style="padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.08)">Expand Screen</button>
        `;
        Object.assign(menu.style, menuStyleHidden());
        tile.appendChild(menu);

        // clicking tile toggles menu (not the overlay)
        const onTileClick = (ev: Event) => {
          const target = ev.target as HTMLElement;
          if (target.closest("#ezcam-menu")) return;
          toggleMenu(tile!);
        };
        tile.addEventListener("click", onTileClick);
        cleanupFns.push(() => tile.removeEventListener("click", onTileClick));

        // menu actions
        const profileBtn = menu.querySelector<HTMLButtonElement>("#ezcam-menu-profile")!;
        const expandBtn = menu.querySelector<HTMLButtonElement>("#ezcam-menu-expand")!;

        profileBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const u = usernameRef.current.toLowerCase();
          window.location.href = `/profile/${encodeURIComponent(u)}`;
        });

        const onExpand = (ev: Event) => {
          ev.stopPropagation();
          const expanded = tile!.dataset.expanded === "true";
          if (expanded) {
            collapseAllTiles();
          } else {
            expandTile(tile!);
          }
          expandBtn.textContent = tile!.dataset.expanded === "true" ? "Exit Expand" : "Expand Screen";
        };
        expandBtn.addEventListener("click", onExpand);
        cleanupFns.push(() => expandBtn.removeEventListener("click", onExpand));
      }
      return tile;
    };

    const getVideoArea = () => {
      const panels = document.querySelectorAll(".panel");
      const center = panels[1] as HTMLElement | undefined;
      if (!center) return null;

      const host =
        (center.querySelector(".flex-1") as HTMLElement | null) ||
        (center.querySelector('[class*="flex-1"]') as HTMLElement | null) ||
        center;

      return host;
    };

    const ensureVideoArea = () => {
      const host = getVideoArea();
      if (!host) return null;
      const grid = ensureGrid(host);
      const tile = ensureLocalTile(grid);
      return { grid, tile };
    };

    const removeGrid = () => {
      const grid = getGrid();
      if (grid) grid.remove();
    };

    /* ---------- media control ---------- */

    const onDevices = (e: Event) => {
      const { cameraId, micId } = (e as CustomEvent).detail || {};
      selectedCameraId.current = cameraId;
      selectedMicId.current = micId;
      if (streamRef.current) startStream(true).catch(console.warn);
      renderOverlay();
    };
    window.addEventListener("devices:selected", onDevices as EventListener);
    cleanupFns.push(() => window.removeEventListener("devices:selected", onDevices as EventListener));

    async function startStream(restart = false) {
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedCameraId.current ? { deviceId: { exact: selectedCameraId.current } } : true,
          audio: selectedMicId.current ? { deviceId: { exact: selectedMicId.current } } : true,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (restart && streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
        streamRef.current = newStream;

        newStream.getVideoTracks().forEach((t) => (t.enabled = videoEnabled.current));
        newStream.getAudioTracks().forEach((t) => (t.enabled = audioEnabled.current));

        const area = ensureVideoArea();
        if (!area) return;

        // Default layout every start: NOT expanded
        resetDefaultLayout();

        const videoEl = area.tile.querySelector<HTMLVideoElement>("#ezcam-local-video")!;
        // @ts-expect-error - srcObject exists in browsers
        videoEl.srcObject = newStream;

        hide(btnCam, false);
        hide(btnMic, false);
        renderBroadcast();
        renderCamera();
        renderMic();
        renderOverlay(area.tile);
      } catch (err) {
        console.error("getUserMedia failed:", err);
        alert("Unable to access camera/microphone. Use HTTPS/localhost and allow permissions.");
        renderBroadcast();
      }
    }

    function stopStream() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      removeGrid(); // remove tiles so no black boxes linger
      hide(btnCam, true);
      hide(btnMic, true);

      videoEnabled.current = true;
      audioEnabled.current = true;

      renderBroadcast();
      renderCamera();
      renderMic();
    }

    /* ---------- header button renders ---------- */

    function renderBroadcast() {
      if (!btnBroadcast) return;
      btnBroadcast.classList.remove("bg-red-600", "hover:bg-red-500", "bg-emerald-600/90", "hover:bg-emerald-500");
      const live = !!streamRef.current;
      if (live) {
        btnBroadcast.textContent = "Stop Broadcasting";
        setRed(btnBroadcast);
      } else {
        btnBroadcast.textContent = "Start Broadcasting";
        setGreen(btnBroadcast);
      }
    }
    function renderCamera() {
      if (!btnCam) return;
      const on = videoEnabled.current && !!streamRef.current;
      btnCam.textContent = on ? "Camera Off" : "Camera On";
      (on ? setRed : setGreen)(btnCam);
    }
    function renderMic() {
      if (!btnMic) return;
      const on = audioEnabled.current && !!streamRef.current;
      btnMic.textContent = on ? "Mute Microphone" : "Unmute Microphone";
      (on ? setRed : setGreen)(btnMic);
      renderOverlay();
    }

    /* ---------- attach controls ---------- */

    const attach = () => {
      btnBroadcast = findButtonByLabels(["start broadcasting", "stop broadcasting"]);
      btnCam = findButtonByLabels(["camera on/off", "camera on", "camera off"]);
      btnMic = findButtonByLabels(["mute microphone", "unmute microphone"]);
      if (!(btnBroadcast && btnCam && btnMic)) return false;

      renderBroadcast();
      hide(btnCam, true);
      hide(btnMic, true);

      const onBroadcast = () => (streamRef.current ? stopStream() : startStream().catch(console.warn));
      const onCam = () => {
        if (!streamRef.current) return;
        const v = streamRef.current.getVideoTracks()[0];
        if (!v) return;
        v.enabled = !v.enabled;
        videoEnabled.current = v.enabled;
        renderCamera();
      };
      const onMic = () => {
        if (!streamRef.current) return;
        const a = streamRef.current.getAudioTracks()[0];
        if (!a) return;
        a.enabled = !a.enabled;
        audioEnabled.current = a.enabled;
        renderMic();
      };

      btnBroadcast.addEventListener("click", onBroadcast);
      btnCam.addEventListener("click", onCam);
      btnMic.addEventListener("click", onMic);

      cleanupFns.push(() => {
        btnBroadcast?.removeEventListener("click", onBroadcast);
        btnCam?.removeEventListener("click", onCam);
        btnMic?.removeEventListener("click", onMic);
      });

      // Close any open tile menus if user clicks elsewhere
      const onDocClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("#ezcam-menu") || target.closest(".ezcam-tile")) return;
        getAllTiles().forEach(hideMenu);
      };
      document.addEventListener("click", onDocClick);
      cleanupFns.push(() => document.removeEventListener("click", onDocClick));

      return true;
    };

    if (!attach()) {
      const id = window.setInterval(() => {
        if (attach()) window.clearInterval(id);
      }, 300);
      cleanupFns.push(() => window.clearInterval(id));
    }

    /* ---------- CHAT PATCH: input pinned to bottom & username added ---------- */
    {
      const chatInput =
        (document.querySelector('input[placeholder*="message" i]') as HTMLInputElement | null) ||
        (document.querySelector('textarea[placeholder*="message" i]') as HTMLTextAreaElement | null);

      const chatSendBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => ((b.textContent || "").trim().toLowerCase() === "send")
      ) as HTMLButtonElement | null;

      const chatForm = chatInput?.closest("form") as HTMLFormElement | null;

      // Ensure panel behaves like a column with input row at the bottom.
      const ensureLayout = () => {
        // Prefer the panel that actually contains the input; avoid a generic fallback
        const chatPanel =
          (chatInput?.closest(".panel") as HTMLElement | null) ||
          (chatSendBtn?.closest(".panel") as HTMLElement | null);

        if (!chatPanel) {
          return { inputRow: null as HTMLElement | null, list: null as HTMLDivElement | null };
        }

        // Force a clean column layout so bottom stays bottom (non-destructive)
        chatPanel.style.display = "flex";
        chatPanel.style.flexDirection = "column";
        chatPanel.style.alignItems = "stretch";
        chatPanel.style.justifyContent = "stretch";

        const inputRow = (chatSendBtn?.closest("div") || chatInput?.closest("div")) as HTMLElement | null;

        let list = chatPanel.querySelector("#ezchat-messages") as HTMLDivElement | null;
        if (!list) {
          list = document.createElement("div");
          list.id = "ezchat-messages";
          Object.assign(list.style, {
            flex: "1 1 auto",
            overflowY: "auto",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          });
          chatPanel.appendChild(list);
        }

        // SAFETY GUARDS to avoid "HierarchyRequestError":
        // Only reorder if chatPanel actually contains inputRow, and inputRow does NOT contain chatPanel.
        if (inputRow && chatPanel.contains(inputRow) && !inputRow.contains(chatPanel)) {
          // Make input the last child if it isn't already
          if (chatPanel.lastElementChild !== inputRow) {
          }
          // Make list sit right above inputRow if it isn't already
          if (list.nextSibling !== inputRow) {
            
          }
        }

        // Hide "No messages yet." placeholder if present
        const placeholder = Array.from(chatPanel.querySelectorAll("*")).find(
          (el) => ((el.textContent || "").trim().toLowerCase() === "no messages yet.")
        ) as HTMLElement | undefined;
        if (placeholder) placeholder.style.display = "none";

        return { inputRow, list };
      };

      // Make sure layout is correct once on load
      ensureLayout();

      const handleSend = (e?: Event) => {
        e?.preventDefault();
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        // make sure layout/order is still correct (in case of react re-render)
        const { list } = ensureLayout();
        if (!list) return;

        // message wrapper with username
        const item = document.createElement("div");
        item.className = "ezchat-item";
        Object.assign(item.style, { maxWidth: "100%" });

        const nameEl = document.createElement("div");
        nameEl.textContent = usernameRef.current;
        Object.assign(nameEl.style, {
          fontSize: "11px",
          opacity: "0.7",
          marginBottom: "2px",
        });

        const bubble = document.createElement("div");
        bubble.className = "ezchat-msg-self";
        bubble.textContent = text;
        Object.assign(bubble.style, {
          background: "rgba(255,255,255,0.06)",
          padding: "6px 10px",
          borderRadius: "10px",
          wordBreak: "break-word",
        });

        item.appendChild(nameEl);
        item.appendChild(bubble);
        list.appendChild(item);
        list.scrollTop = list.scrollHeight;

        chatInput.value = "";
      };

      if (chatSendBtn) {
        chatSendBtn.setAttribute("type", "button"); // stop form submit/navigation
        chatSendBtn.addEventListener("click", handleSend);
        cleanupFns.push(() => chatSendBtn.removeEventListener("click", handleSend));
      }

      if (chatForm) {
        const onSubmit = (e: Event) => e.preventDefault();
        chatForm.addEventListener("submit", onSubmit);
        cleanupFns.push(() => chatForm.removeEventListener("submit", onSubmit));
      }

      if (chatInput) {
        const onKey = (e: KeyboardEvent) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(e);
          }
        };
        chatInput.addEventListener("keydown", onKey);
        cleanupFns.push(() => chatInput.removeEventListener("keydown", onKey));
      }
    }
    /* ---------- END CHAT PATCH ---------- */

    return () => {
      cleanupFns.forEach((fn) => fn());
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      const grid = document.querySelector("#ezcam-grid");
      grid?.remove();
    };
  }, []);

  return null;
}
