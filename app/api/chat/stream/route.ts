import { NextRequest } from "next/server";
import { subscribeChat } from "@/lib/server/chat";
import { pickString } from "@/lib/guards";

export const runtime = "edge"; // good for SSE

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  if (!room) {
    return new Response("Missing room", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const unsub = subscribeChat(room, send);

      // Optional: greet with username if passed
      const username = pickString(Object.fromEntries(searchParams), "username");
      if (username) send({ type: "hello", username });

      controller.enqueue(encoder.encode(`event: ready\ndata: {}\n\n`));

      const close = () => {
        unsub();
        controller.close();
      };
      // disconnect handling
      // @ts-expect-error: web runtime close reason
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
