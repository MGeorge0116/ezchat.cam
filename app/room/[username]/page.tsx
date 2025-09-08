import * as React from "react";
import RoomShell from "@/app/room/RoomShell";

type PageProps = {
  params: { username: string };
};

export const dynamic = "force-dynamic";

export default function RoomPage({ params }: PageProps) {
  const { username } = params;
  // The RoomShell is assumed to be a Client Component handling the 3-column layout,
  // video grid, chat pane, and controls. We pass only the typed username.
  return <RoomShell username={username} />;
}
