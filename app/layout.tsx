// web/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import Providers from "../components/Providers";
import ThemeToggle from "../components/ThemeToggle";
import AuthMenu from "../components/AuthMenu";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EZChat.Cam",
  description: "webcam chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* Top header */}
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 40,
              background: "var(--bg)",
              borderBottom: "1px solid var(--edge)",
            }}
          >
            <div className="wrap" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
              <Link href="/" className="brand" style={{ fontWeight: 700, textDecoration: "none", color: "var(--text)" }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#f59e0b", marginRight: 8 }} />
                EZChat.Cam
              </Link>
              <Link href="/" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }}>
                webcam chat
              </Link>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <ThemeToggle />
                <AuthMenu />
              </div>
            </div>
          </header>

          {/* Page content */}
          <main>{children}</main>

          {/* Centered footer on every page */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
