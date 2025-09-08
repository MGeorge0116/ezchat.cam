import { use } from "react";
import RoomShell from "../../../components/room/RoomShell";

export default function RoomPage({
  params,
}: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  return <RoomShell roomName={username} />;
}
