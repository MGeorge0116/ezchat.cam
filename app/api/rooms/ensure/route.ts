export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 });
  // No-op: stub for ensuring a room exists.
  return NextResponse.json({ ok: true, name: String(name).toLowerCase() });
}
