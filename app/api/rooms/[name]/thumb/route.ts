// C:\Users\MGeor\OneDrive\Desktop\EZChat\agora-app-builder\web\app\api\rooms\[name]\thumb\route.ts

import { NextRequest, NextResponse } from "next/server";
import { getThumb, setThumb, placeholderSvg } from "../../../../../lib/thumbStore";

/**
 * GET  /api/rooms/:name/thumb
 *  -> Returns the latest snapshot (binary). Falls back to SVG placeholder.
 *
 * POST /api/rooms/:name/thumb
 *  Body: { dataUrl: "data:image/jpeg;base64,..." }
 *  -> Stores a snapshot that GET will return.
 *
 * Notes:
 * - This is in-memory storage (per server instance). For production, back with
 *   a persistent store (S3, Redis, DB). This is additive & dev-friendly.
 */

export async function GET(
  req: NextRequest,
  ctx: { params: { name: string } }
) {
  const name = decodeURIComponent(ctx.params.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Missing room name" }, { status: 400 });
  }

  const found = getThumb(name);
  if (found) {
    // found.data is a DataURL like data:image/jpeg;base64,xxxx
    const match = /^data:(.+?);base64,(.+)$/.exec(found.data);
    if (match) {
      const mime = match[1];
      const b64 = match[2];
      const buf = Buffer.from(b64, "base64");
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Cache-Control": "public, max-age=60", // clients still get refresh via cache-busting
        },
      });
    }
  }

  // Fallback: SVG placeholder rendered with room name and updatedAt or 'live'
  const svg = placeholderSvg(name, found?.updatedAt ?? Date.now());
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: { name: string } }
) {
  const name = decodeURIComponent(ctx.params.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Missing room name" }, { status: 400 });
  }

  // Accept JSON with { dataUrl }
  try {
    const body = (await req.json()) as { dataUrl?: string };
    if (!body?.dataUrl || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(body.dataUrl)) {
      return NextResponse.json(
        { error: "Expect JSON { dataUrl: 'data:image/...;base64,xxx' }" },
        { status: 400 }
      );
    }
    setThumb(name, body.dataUrl);
    return NextResponse.json({ ok: true, room: name });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Bad JSON" }, { status: 400 });
  }
}
