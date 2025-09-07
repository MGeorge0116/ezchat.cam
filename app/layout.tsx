// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/app/providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "EZChat.Cam",
  description: "Webcam chat rooms",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-screen h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1 min-h-0">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
