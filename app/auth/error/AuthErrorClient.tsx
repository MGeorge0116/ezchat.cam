"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AuthErrorClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const code = sp?.get("error") ?? "Unknown";

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        Sign-in Error
      </h1>
      <p style={{ marginBottom: 16 }}>
        Something went wrong while signing you in.
      </p>
      <code
        style={{
          display: "inline-block",
          padding: "8px 10px",
          background: "#111827",
          color: "#e5e7eb",
          borderRadius: 8,
          border: "1px solid #374151",
          marginBottom: 16,
        }}
      >
        {code}
      </code>

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" onClick={() => router.push("/auth/login")}>
          Back to Sign in
        </button>
        <button className="btn" onClick={() => router.push("/")}>
          Go home
        </button>
      </div>
    </div>
  );
}
