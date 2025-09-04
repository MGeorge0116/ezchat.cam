// app/api/directory/rooms/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const promoted = searchParams.get("promoted") === "true";
  const rooms = await prisma.room.findMany({
    where: promoted ? { promoted: true } : {},
    orderBy: [{ promoted: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      name: true,
      title: true,
      ownerId: true,
      lastSeenAt: true,
      description: true,
      snapshotData: true,
      snapshotUpdatedAt: true,
      cameraCount: true,
      userCount: true,
      owner: { select: { username: true } },
    },
  });
  return NextResponse.json(
    rooms.map(r => ({
      id: r.id,
      name: r.name,
      title: r.title,
      ownerId: r.ownerId,
      lastSeenAt: r.lastSeenAt?.toISOString(),
      description: r.description,
      snapshotUrl: r.snapshotData ? `data:image/png;base64,${r.snapshotData}` : null,
      snapshotUpdatedAt: r.snapshotUpdatedAt?.toISOString(),
      cameraCount: r.cameraCount,
      userCount: r.userCount,
      owner: { username: r.owner?.username ?? r.name },
    })),
  );
}