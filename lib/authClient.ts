// Client-safe "who am I?"
export type Me = { id: string; username: string; email: string; createdAt: string } | null;

export async function fetchMe(): Promise<Me> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json().catch(() => ({}));
    return (data?.user as Me) ?? null;
  } catch {
    return null;
  }
}
