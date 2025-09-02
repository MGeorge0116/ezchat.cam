export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getMemberThumb,
  setMemberThumb,
  memberPlaceholderSvg,
} from "@/lib/directoryStore";

/**
 * Supports BOTH styles:
 *   1) Dynamic params: /api/directory/rooms/:name/member/:uid/thumb
 *   2) Query params :  /api/directory/rooms/member/thumb?name=...&uid=...
 */

function readNameUid(req: NextRequest, ctx?: { params?: Record<string, string> }) {
  const url = new URL(req.url);
  const nameParam = ctx?.params?.name ?? url.searchParams.get("name") ?? "";
  const uidParam = ctx?.params?.uid ?? url.searchParams.get("uid") ?? "";
  const name = decodeURIComponent(nameParam);
  const uid = decodeURIComponent(uidParam);
  return { name, uid };
}

export async function GET(
  req: NextRequest,
  ctx: { params?: { name?: string; uid?: string } }
) {
  const { name, uid } = readNameUid(req, ctx);

  if (!name || !uid) {
    return NextResponse.json(
      { error: "Missing required parameters: name and uid" },
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

export async function POST(
  req: NextRequest,
  ctx: { params?: { name?: string; uid?: string } }
) {
  const { name, uid } = readNameUid(req, ctx);

  if (!name || !uid) {
    return NextResponse.json(
      { error: "Missing required parameters: name and uid" },
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
