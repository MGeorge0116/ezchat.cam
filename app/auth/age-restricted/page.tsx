import { Suspense } from "react";
import AgeRestrictedClient from "./AgeRestrictedClient";

// Avoid static prerender issues when using client hooks
export const dynamic = "force-dynamic";

export default function AgeRestrictedPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <AgeRestrictedClient />
    </Suspense>
  );
}
