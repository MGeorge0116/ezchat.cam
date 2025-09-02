import Link from "next/link";
import { getUserByUsername, toPublicUser } from "@/lib/userStore";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params; // Next.js 15: params is a Promise
  const handle = decodeURIComponent(username || "");
  const user = await getUserByUsername(handle);

  if (!user) {
    return (
      <main className="wrap" style={{ maxWidth: 720 }}>
        <h1 style={{ margin: "16px 0 12px" }}>User not found</h1>
        <p style={{ color: "var(--muted)" }}>
          No profile for <strong>{handle}</strong>.
        </p>
        <p style={{ marginTop: 12 }}>
          <Link href="/" className="btn">Go back</Link>
        </p>
      </main>
    );
  }

  const pub = toPublicUser(user);

  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <h1 style={{ margin: "16px 0 12px" }}>@{pub.username}</h1>
      <div style={{ color: "var(--muted)" }}>{pub.email}</div>
      <div style={{ marginTop: 12 }}>
        <Link href={`/room/${encodeURIComponent(pub.username)}`} className="btn">
          Enter {pub.username}&apos;s Room
        </Link>
      </div>
    </main>
  );
}
