import { Suspense } from "react";
import LoginClient from "./LoginClient";

// Avoid static prerender issues when using client hooks
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
