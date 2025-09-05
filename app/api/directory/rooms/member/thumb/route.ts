// app/api/directory/rooms/member/thumb/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/directory/rooms/member/thumb?data=<dataURL>
 *    or
 * GET /api/directory/rooms/member/thumb?b64=<base64>&mime=image/png
 *
 * Responds with the decoded image bytes and correct Content-Type.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qp = url.searchParams;

    // Accept either a data URL or raw base64 + mime
    const dataUrl = qp.get("data") ?? qp.get("src") ?? "";
    const b64 = qp.get("b64");
    const mimeParam = qp.get("mime") ?? "image/png";

    let blob: Blob;
    let mime: string;

    if (dataUrl && dataUrl.startsWith("data:")) {
      const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) {
        return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
      }
      mime = m[1];
      const buf = Buffer.from(m[2], "base64");
      blob = new Blob([buf], { type: mime });
    } else if (b64) {
      mime = mimeParam;
      const buf = Buffer.from(b64, "base64");
      blob = new Blob([buf], { type: mime });
    } else {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (err) {
    console.error("thumb route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
