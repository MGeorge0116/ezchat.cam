import { NextRequest, NextResponse } from "next/server";
import { requireStrings } from "@/lib/guards";
import type { ChatPostBody, ChatMessage } from "@/lib/types";
import { appendMessage } from "@/lib/server/chat";

export async function POST(req: NextRequest) {
  const bodyUnknown: unknown = await req.json();
  if (!requireStrings(bodyUnknown, ["room", "username", "text"])) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const body = bodyUnknown as ChatPostBody;

  const msg: ChatMessage = await appendMessage(body.room, {
    username: body.username,
    text: body.text,
  });

  return NextResponse.json(msg, { status: 201 });
}
