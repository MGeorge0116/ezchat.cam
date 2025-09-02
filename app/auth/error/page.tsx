// web/app/auth/error/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function AuthErrorPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const code = sp.get("error") ?? "Unknown";

  return (
    <main className="wrap" style={{ maxWidth: 600 }}>
      <h1 style={{ margin: "16px 0 12px" }}>Sign-in error</h1>
      <p style={{ color: "var(--muted)" }}>
        Something went wrong during authentication.
      </p>
      <p style={{ color: "var(--muted)" }}>
        Error code: <code>{code}</code>
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className="btn" onClick={() => router.push("/auth/login")}>Back to Sign in</button>
        <button className="btn" onClick={() => router.push("/")}>Go home</button>
      </div>
    </main>
  );
}
