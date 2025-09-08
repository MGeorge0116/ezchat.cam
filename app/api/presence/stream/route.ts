import { NextRequest } from "next/server";
import { subscribePresence } from "@/lib/server/presence";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  if (!room) return new Response("Missing room", { status: 400 });

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const unsub = subscribePresence(room, send);

      controller.enqueue(encoder.encode(`event: ready\ndata: {}\n\n`));
      const close = () => {
        unsub();
        controller.close();
      };
      // @ts-expect-error web runtime
      req.signal?.addEventListener("abort", close);
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
