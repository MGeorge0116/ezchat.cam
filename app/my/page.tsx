"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyRoomRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Preferred order: auth:username → profile:username → room:last → ui:username
    const username =
      localStorage.getItem("auth:username") ||
      localStorage.getItem("profile:username") ||
      localStorage.getItem("room:last") ||
      localStorage.getItem("ui:username");

    if (username && typeof username === "string") {
      router.replace(`/room/${username.toLowerCase()}`);
    } else {
      // Graceful fallback — send to homepage; user can sign in or set username
      router.replace("/");
    }
  }, [router]);

  return null;
}
