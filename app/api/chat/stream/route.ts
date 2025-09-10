export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";

type WithSignal = { signal: AbortSignal };
function hasSignal(x: unknown): x is WithSignal {
  return typeof x === "object" && x !== null && "signal" in x;
}

export async function GET(req: NextRequest) {
  const { subscribeChat } = await import("@/lib/server/chat"); // lazy import!

  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  if (!room) return new Response("Missing room", { status: 400 });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      const unsub = subscribeChat(room, send);
      controller.enqueue(encoder.encode(`event: ready\ndata: {}\n\n`));

      const close = () => { try { unsub(); } finally { controller.close(); } };
      if (hasSignal(req)) req.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
