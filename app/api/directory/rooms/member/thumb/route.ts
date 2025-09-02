import { NextRequest, NextResponse } from "next/server";
import { getMemberThumb, setMemberThumb, memberPlaceholderSvg } from "../../../../../../../lib/directoryStore";

/**
 * GET  /api/directory/rooms/:name/member/:uid/thumb
 *   -> returns image (jpeg/png/webp) or SVG placeholder if none
 *
 * POST /api/directory/rooms/:name/member/:uid/thumb
 *   Body: { dataUrl: 'data:image/jpeg;base64,...' }
 *   -> stores a snapshot for that member
 */

export async function GET(
  req: NextRequest,
  ctx: { params: { name: string; uid: string } }
) {
  const name = decodeURIComponent(ctx.params.name || "");
  const uid = decodeURIComponent(ctx.params.uid || "");
  const found = getMemberThumb(name, uid);
  if (found) {
    const m = /^data:(.+?);base64,(.+)$/.exec(found);
    if (m) {
      const mime = m[1], b64 = m[2];
      const buf = Buffer.from(b64, "base64");
      return new NextResponse(buf, {
        status: 200,
        headers: { "Content-Type": mime, "Cache-Control": "public, max-age=60" },
      });
    }
  }
  const svg = memberPlaceholderSvg(name, uid);
  return new NextResponse(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=60" },
  });
}

export async function POST(
  req: NextRequest,
  ctx: { params: { name: string; uid: string } }
) {
  const name = decodeURIComponent(ctx.params.name || "");
  const uid = decodeURIComponent(ctx.params.uid || "");
  try {
    const body = await req.json();
    const dataUrl: string | undefined = body?.dataUrl;
    if (!dataUrl || !/^data:image\/(png|jpeg|jpg|webp);base64,/.test(dataUrl)) {
      return NextResponse.json({ error: "Expect { dataUrl: 'data:image/...;base64,xxx' }" }, { status: 400 });
    }
    setMemberThumb(name, uid, dataUrl);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Bad JSON" }, { status: 400 });
  }
}
