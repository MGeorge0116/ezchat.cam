"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AgeRestrictedPage() {
  const sp = useSearchParams();
  const returnTo = sp.get("callbackUrl") || "/";

  const [agree, setAgree] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function confirm() {
    setError(null);
    if (!agree) {
      setError("You must confirm you are 18 or older.");
      return;
    }
    setBusy(true);
    const r = await fetch("/api/auth/verify-age", { method: "POST" });
    if (!r.ok) {
      setBusy(false);
      setError("Could not verify age.");
      return;
    }
    // Refresh JWT to include ageVerifiedAt, then return to original page
    await signOut({
      callbackUrl: `/auth/login?callbackUrl=${encodeURIComponent(returnTo)}`,
    });
  }

  return (
    <main className="wrap" style={{ maxWidth: 720 }}>
      <h1 style={{ margin: "16px 0 12px" }}>Age restriction</h1>
      <p style={{ color: "var(--muted)", marginBottom: 12 }}>
        You must be at least 18 years old to access chat rooms on EZChat.Cam.
      </p>

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        I confirm that I am 18 years of age or older.
      </label>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button className="btn" onClick={confirm} disabled={busy}>
          {busy ? "Saving…" : "Confirm & Continue"}
        </button>
      </div>

      {error && <div style={{ color: "#fca5a5", marginTop: 10 }}>{error}</div>}
    </main>
  );
}
