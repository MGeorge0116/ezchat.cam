// app/room/[username]/page.tsx
import RoomClient from "@/components/room/RoomClient";

type Params = { username: string };

export default async function RoomPage(props: { params: Promise<Params> }) {
  const { username } = await props.params; // Next 15.5.2: params is a Promise
  return <RoomClient username={username} />;
}
