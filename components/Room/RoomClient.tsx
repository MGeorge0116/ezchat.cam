// components/room/RoomClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoomShell from "./RoomShell";

export default function RoomClient({ username }: { username: string }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const signed =
      localStorage.getItem("auth:username") ||
      localStorage.getItem("profile:username") ||
      localStorage.getItem("ui:username");

    if (!signed) {
      // Unsigned users cannot join a chat room → send to homepage with auth prompt.
      router.replace("/?auth=required");
    } else {
      setAllowed(true);
    }
  }, [router]);

  if (!allowed) return null;
  return <RoomShell roomName={username} />;
}
