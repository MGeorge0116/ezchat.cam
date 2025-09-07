// app/api/presence/stream/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { list, subscribe } from "@/lib/server/presence";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const room = String(url.searchParams.get("room") || "").toLowerCase();
  if (!room) return new Response("room required", { status: 400 });

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const payload = { users: list(room).map((u) => ({
          username: u.username,
          lastSeen: new Date(u.lastSeen).toISOString(),
          isLive: !!u.isLive,
        }))};
        controller.enqueue(enc.encode(`event: update\ndata: ${JSON.stringify(payload)}\n\n`));
      };
      send();
      const unsub = subscribe(room, send);
      const ping = setInterval(() => controller.enqueue(enc.encode(`: ping\n\n`)), 15_000);
      const abort = () => { clearInterval(ping); unsub(); try { controller.close(); } catch {} };
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
