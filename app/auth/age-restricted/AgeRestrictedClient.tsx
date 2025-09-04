"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AgeRestrictedClient() {
  const router = useRouter();
  const sp = useSearchParams();

  // Where to go after the user acknowledges; falls back to home
  const returnTo = sp?.get("callbackUrl") ?? "/";

  return (
    <div style={{ maxWidth: 620, margin: "48px auto", padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        Age Restriction
      </h1>

      <p style={{ marginBottom: 12 }}>
        Your account needs to be <strong>age-verified</strong> to access this page.
      </p>

      <p style={{ marginBottom: 18, color: "var(--muted)" }}>
        If you believe this is a mistake, please contact support or try signing in with a different account.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        <button
          className="btn"
          onClick={() => router.push("/auth/login")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            border: "1px solid var(--btn-edge)",
            background: "var(--btn)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Back to Sign in
        </button>

        <button
          className="btn"
          onClick={() => router.push(returnTo || "/")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            border: "1px solid var(--btn-edge)",
            background: "var(--btn)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Go Back
        </button>

        <button
          className="btn"
          onClick={() => router.push("/")}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            fontWeight: 700,
            border: "1px solid var(--btn-edge)",
            background: "var(--btn)",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          Go Home
        </button>
      </div>

      <div style={{ fontSize: 13, color: "var(--muted)" }}>
        You were headed to:{" "}
        <code
          style={{
            padding: "2px 6px",
            borderRadius: 6,
            border: "1px solid var(--edge)",
            background: "var(--panel)",
          }}
        >
          {returnTo}
        </code>
      </div>
    </div>
  );
}
