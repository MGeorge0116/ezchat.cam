export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import {
  getMemberThumb,
  setMemberThumb,
  memberPlaceholderSvg,
} from "@/lib/directoryStore";

/**
 * GET  /api/directory/rooms/member/thumb?name=<room>&uid=<userId>
 * POST /api/directory/rooms/member/thumb?name=<room>&uid=<userId>
 *   Body: { dataUrl: 'data:image/png;base64,...' }
 */

function readNameUid(req: NextRequest) {
  const url = new URL(req.url);
  const name = decodeURIComponent(url.searchParams.get("name") || "");
  const uid = decodeURIComponent(url.searchParams.get("uid") || "");
  return { name, uid };
}

export async function GET(req: NextRequest) {
  const { name, uid } = readNameUid(req);
  if (!name || !uid) {
    return NextResponse.json(
      { error: "Missing required query params: name and uid" },
      { status: 400 }
    );
  }

  const found = getMemberThumb(name, uid);
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

  const svg = memberPlaceholderSvg(name, uid);
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

export async function POST(req: NextRequest) {
  const { name, uid } = readNameUid(req);
  if (!name || !uid) {
    return NextResponse.json(
      { error: "Missing required query params: name and uid" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => ({} as any));
    const dataUrl: string | undefined = body?.dataUrl;

    if (
      !dataUrl ||
      !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(String(dataUrl))
    ) {
      return NextResponse.json(
        { error: "Expect { dataUrl: 'data:image/...;base64,xxx' }" },
        { status: 400 }
      );
    }

    setMemberThumb(name, uid, dataUrl);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Bad JSON" },
      { status: 400 }
    );
  }
}
