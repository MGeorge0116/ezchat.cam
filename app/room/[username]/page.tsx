// app/room/[username]/page.tsx
import { use } from "react";
import RoomClient from "../../../components/room/RoomClient";

export default function RoomPage({
  params,
}: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  return <RoomClient roomName={username} />;
}
