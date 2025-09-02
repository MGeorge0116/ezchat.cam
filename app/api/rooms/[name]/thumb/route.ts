export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getRoomThumb,
  setRoomThumb,
  roomPlaceholderSvg,
} from "@/lib/thumbStore";

/**
 * GET  /api/rooms/[name]/thumb
 * POST /api/rooms/[name]/thumb
 * Body (POST): { dataUrl: 'data:image/png;base64,...' }
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const room = decodeURIComponent(name || "");

  const found = getRoomThumb(room);
  if (found) {
    const m = /^data:(.+?);base64,(.+)$/.exec(found);
    if (m) {
      const mime = m[1];
      const b64 = m[2];
      const buf = Buffer.from(b64, "base64");
      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Type": mime,
          "Cache-Control": "public, max-age=60",
        },
      });
    }
  }

  const svg = roomPlaceholderSvg(room);
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
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const room = decodeURIComponent(name || "");

  try {
    const body = await req.json().catch(() => ({} as { dataUrl?: string }));
    const dataUrl = body?.dataUrl;

    if (
      !dataUrl ||
      !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(String(dataUrl))
    ) {
      return NextResponse.json(
        { error: "Expect { dataUrl: 'data:image/...;base64,xxx' }" },
        { status: 400 }
      );
    }

    setRoomThumb(room, dataUrl);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "Bad JSON" },
      { status: 400 }
    );
  }
}
