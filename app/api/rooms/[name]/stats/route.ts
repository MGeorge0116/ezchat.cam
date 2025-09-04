// app/api/rooms/[name]/stats/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const roomName = params.name;

  // TODO: replace with real DB values
  return NextResponse.json({
    roomName,
    cameraCount: 0,
    userCount: 0,
    snapshotUrl: null,
    description: "",
    updatedAt: new Date().toISOString(),
  });
}
