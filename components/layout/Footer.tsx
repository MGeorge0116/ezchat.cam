// components/layout/Footer.tsx
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col items-center gap-2 text-sm">
        {/* Links row: centered; Donate is disabled */}
        <div className="flex items-center gap-6">
          <span
            className="opacity-60 cursor-not-allowed select-none"
            aria-disabled="true"
            title="Donations are currently disabled"
          >
            Donate
          </span>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
        </div>

        {/* Copyright row: centered */}
        <div className="opacity-70">
          © {new Date().getFullYear()} EZChat.Cam. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
