// app/api/directory/rooms/member/thumb/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "node:buffer";

/**
 * GET /api/directory/rooms/member/thumb?data=<dataURL>
 *    or
 * GET /api/directory/rooms/member/thumb?b64=<base64>&mime=image/png
 *
 * Responds with decoded image bytes and proper Content-Type.
 */

function base64ToArrayBuffer(b64: string): ArrayBuffer {
  // Decode to a Node Buffer, then copy into a fresh ArrayBuffer
  // to avoid ArrayBuffer|SharedArrayBuffer type unions.
  const buf = Buffer.from(b64, "base64");
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  view.set(buf); // copy bytes
  return ab;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qp = url.searchParams;

    const dataUrl = qp.get("data") ?? qp.get("src") ?? "";
    const b64 = qp.get("b64");
    const mimeParam = qp.get("mime") ?? "image/png";

    let mime: string;
    let bodyAb: ArrayBuffer;

    if (dataUrl && dataUrl.startsWith("data:")) {
      const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!m) {
        return NextResponse.json({ error: "Invalid data URL" }, { status: 400 });
      }
      mime = m[1];
      bodyAb = base64ToArrayBuffer(m[2]);
    } else if (b64) {
      mime = mimeParam;
      bodyAb = base64ToArrayBuffer(b64);
    } else {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    return new NextResponse(bodyAb, {
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
