// app/api/directory/rooms/member/thumb/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/directory/rooms/member/thumb?data=<dataURL>
 * or
 * GET /api/directory/rooms/member/thumb?b64=<base64>&mime=image/png
 *
 * Returns the image bytes with the correct Content-Type.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qp = url.searchParams;

    // Accept either a data URL (?data=data:...;base64,...) or raw base64 (?b64=...&mime=...)
    const dataUrl = qp.get("data") ?? qp.get("src") ?? "";
    const b64 = qp.get("b64");
    const mimeParam = qp.get("mime") ?? "image/png";

    let arrayBuffer: ArrayBuffer;
    let mime: string;

    if (dataUrl && dataUrl.startsWith("data:")) {
      const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) {
        return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
      }
      mime = m[1];
      const buf = Buffer.from(m[2], "base64");
      // Convert Node Buffer -> ArrayBuffer view for Web Response
      arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } else if (b64) {
      mime = mimeParam;
      const buf = Buffer.from(b64, "base64");
      arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } else {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    return new NextResponse(arrayBuffer, {
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
