// app/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const MAX_DESC = 100;

export default function ProfilePage() {
  const [username, setUsername] = useState<string | null>(null);

  // description
  const [published, setPublished] = useState("");
  const [desc, setDesc] = useState("");
  const [savingDesc, setSavingDesc] = useState(false);

  // avatar
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  // discover signed-in username
  useEffect(() => {
    const u =
      localStorage.getItem("auth:username") ||
      localStorage.getItem("profile:username") ||
      localStorage.getItem("ui:username");
    setUsername(u ? u.toLowerCase() : null);
  }, []);

  // load current desc + avatar
  useEffect(() => {
    if (!username) return;
    setPublished(localStorage.getItem(`profile:desc:${username}`) || "");
    setDesc((localStorage.getItem(`profile:desc:${username}`) || "").slice(0, MAX_DESC));
    setAvatarDataUrl(localStorage.getItem(`profile:avatar:${username}`) || null);
  }, [username]);

  const counter = useMemo(() => `${desc.length}/${MAX_DESC}`, [desc.length]);

  if (!username) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-lg font-semibold mb-2">My Profile</div>
          <p className="text-sm opacity-80">
            Please <Link href="/?auth=required" className="underline">sign in</Link> to edit your room settings.
          </p>
        </div>
      </div>
    );
  }

  async function saveDescription() {
    setSavingDesc(true);
    try {
      const clean = sanitize(desc).slice(0, MAX_DESC);
      localStorage.setItem(`profile:desc:${username}`, clean);

      // Update directory cache so homepage reflects immediately
      try {
        const key = `room:meta:${username}`;
        const metaRaw = localStorage.getItem(key);
        const meta = metaRaw ? JSON.parse(metaRaw) : {};
        meta.description = clean;
        meta.username = username;
        meta.lastSeen = Date.now();
        localStorage.setItem(key, JSON.stringify(meta));
      } catch {}
      setPublished(clean);
    } finally {
      setSavingDesc(false);
    }
  }

  async function onPickAvatar(file: File) {
    if (!file) return;
    // cap file size we hold in localStorage (~ 500KB is reasonable)
    const dataUrl = await fileToDataURL(file, 800, 800, 0.9);
    setAvatarDataUrl(dataUrl);
  }

  async function saveAvatar() {
    if (!avatarDataUrl) return;
    setSavingAvatar(true);
    try {
      localStorage.setItem(`profile:avatar:${username}`, avatarDataUrl);
      // Update directory cache immediately
      try {
        const key = `room:meta:${username}`;
        const metaRaw = localStorage.getItem(key);
        const meta = metaRaw ? JSON.parse(metaRaw) : {};
        meta.avatarDataUrl = avatarDataUrl;
        meta.username = username;
        meta.lastSeen = Date.now();
        localStorage.setItem(key, JSON.stringify(meta));
      } catch {}
    } finally {
      setSavingAvatar(false);
    }
  }

  function clearAvatar() {
    setAvatarDataUrl(null);
    try {
      localStorage.removeItem(`profile:avatar:${username}`);
      const key = `room:meta:${username}`;
      const metaRaw = localStorage.getItem(key);
      const meta = metaRaw ? JSON.parse(metaRaw) : {};
      meta.avatarDataUrl = "";
      localStorage.setItem(key, JSON.stringify(meta));
    } catch {}
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Description */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-lg font-semibold mb-3">
          Room Description <span className="opacity-70 text-sm">(shown on directory and My Room)</span>
        </div>

        <div className="text-sm mb-3">
          <span className="opacity-70 mr-2">Currently published:</span>
          <span className="">{published || "—"}</span>
        </div>

        <label className="block text-xs opacity-70 mb-1">Description</label>
        <div className="flex items-center gap-2">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value.slice(0, MAX_DESC))}
            maxLength={MAX_DESC}
            placeholder="Describe your room (max 100 characters)…"
            className="flex-1 rounded-xl bg-black/30 px-3 py-2 outline-none"
          />
          <button
            onClick={saveDescription}
            disabled={savingDesc}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
          >
            {savingDesc ? "Saving…" : "Submit"}
          </button>
          <span className="text-xs opacity-70">{counter}</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-lg font-semibold mb-3">Room Avatar (thumbnail)</div>

        <div className="flex items-start gap-4">
          <div className="w-40 aspect-square bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
            {avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarDataUrl} alt="avatar preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs opacity-70">No avatar yet</span>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-xs opacity-70 mb-1">Upload image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPickAvatar(f);
              }}
              className="block text-sm"
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={saveAvatar}
                disabled={!avatarDataUrl || savingAvatar}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                {savingAvatar ? "Saving…" : "Save Avatar"}
              </button>
              <button
                onClick={clearAvatar}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                Remove
              </button>
            </div>

            <p className="text-xs opacity-70 mt-2">
              Tip: square images (at least 400×400) look best. We store a compressed version locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function sanitize(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

/** Read file as a compressed DataURL, optionally resizing to fit within maxW/H. */
async function fileToDataURL(file: File, maxW = 800, maxH = 800, quality = 0.92) {
  const buf = await file.arrayBuffer();
  const blobUrl = URL.createObjectURL(new Blob([buf]));
  const img = await loadImg(blobUrl);
  const { canvas, ctx, w, h } = fitCanvas(img.width, img.height, maxW, maxH);
  ctx.drawImage(img, 0, 0, w, h);
  const data = canvas.toDataURL("image/jpeg", quality);
  URL.revokeObjectURL(blobUrl);
  return data;
}

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function fitCanvas(sw: number, sh: number, maxW: number, maxH: number) {
  let w = sw, h = sh;
  const scale = Math.min(maxW / sw, maxH / sh, 1);
  w = Math.round(sw * scale);
  h = Math.round(sh * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  return { canvas, ctx, w, h };
}
