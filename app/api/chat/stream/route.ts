// app/api/chat/stream/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { getHistory, subscribeChat } from "@/lib/server/chat";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const room = String(url.searchParams.get("room") || "").toLowerCase();
  if (!room) return new Response("room required", { status: 400 });

  const enc = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const push = (event: string, payload: unknown) => {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));
      };

      // initial history
      push("history", getHistory(room, 100));

      // live messages
      const unsub = subscribeChat(room, (msg) => push("message", msg));

      // keepalive
      const ping = setInterval(() => controller.enqueue(enc.encode(`: ping\n\n`)), 15000);

      const abort = () => {
        clearInterval(ping);
        unsub();
        try { controller.close(); } catch {}
      };
      (req as any).signal?.addEventListener?.("abort", abort);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
