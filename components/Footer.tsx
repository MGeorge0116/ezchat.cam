// web/components/Footer.tsx
import React from "react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <nav className="foot-links" aria-label="Footer">
        <Link href="/">Home</Link>
        <span className="sep">|</span>

        {/* Unclickable "Donate" */}
        <span className="link-disabled" aria-disabled="true" title="Donate (coming soon)">
          Donate
        </span>
        <span className="sep">|</span>

        <Link href="/privacy">Privacy Policy</Link>
        <span className="sep">|</span>

        <Link href="/terms">Terms Of Service</Link>
      </nav>

      <div className="copyright">
        Copyright © {year} EZChat.Cam. All Rights Reserved.
      </div>
    </footer>
  );
}
