import { Suspense } from "react";
import AuthErrorClient from "./AuthErrorClient";

// Ensure this page isn't statically prerendered (avoids prerender errors for client hooks)
export const dynamic = "force-dynamic";

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <AuthErrorClient />
    </Suspense>
  );
}
