// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import AuthMenu from "@/components/AuthMenu";
import RoomControlsAgent from "@/components/RoomControlsAgent"; // ⬅️ add this

export const metadata: Metadata = {
  title: "EZCam.Chat",
  description: "EZCam video chat",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-[#0b1220] dark:text-slate-100 antialiased">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-[#0b1220]/80 backdrop-blur">
          <div className="h-14 px-2 sm:px-3 flex items-center justify-between">
            <Link href="/" aria-label="EZCam.Chat home" className="flex items-center gap-2 no-underline">
              <img src="/ezcam-logo.svg" alt="EZCam.Chat" className="h-6 w-6" />
              <span className="text-xl font-extrabold tracking-wide">EZCam.Chat</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <AuthMenu />
            </div>
          </div>
        </header>

        {/* Keep this as-is (pages manage their own width). min-h-0 lets children stretch to footer */}
        <main className="flex-1 min-h-0 mx-auto max-w-6xl w-full px-4 py-6">{children}</main>

        <footer className="border-t border-slate-200/70 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm">
            <div className="flex items-center justify-center gap-4">
              <span className="opacity-40 select-none cursor-not-allowed">Donate</span>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
            </div>
            <div className="mt-2 opacity-70">© {new Date().getFullYear()} EZCam.Chat. All Rights Reserved.</div>
          </div>
        </footer>

        {/* Invisible helper that wires the buttons, camera, and mic */}
        <RoomControlsAgent />
      </body>
    </html>
  );
}
