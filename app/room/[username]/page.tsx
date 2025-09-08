import React from "react";
import RoomShell from "@/components/room/RoomShell"; // ← alias import (works on Vercel)

type Params = { username: string };

export default function RoomPage({
  params,
}: {
  params: Promise<Params> | Params; // supports Next 15 params-as-Promise
}) {
  // unwrap either a plain object or a Promise (for forward-compat)
  // @ts-ignore
  const { username } = typeof (params as any).then === "function"
    ? // @ts-ignore
      React.use(params as Promise<Params>)
    : (params as Params);

  return <RoomShell roomName={username} />;
}
