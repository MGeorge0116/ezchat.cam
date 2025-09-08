export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(_: Request, ctx: { params: { name: string } }) {
  const name = (ctx.params?.name || "").toLowerCase();
  // Minimal stub for stats (no DB needed)
  return NextResponse.json({
    room: name,
    broadcasters: 0,
    users: 0,
    updatedAt: new Date().toISOString(),
  });
}
