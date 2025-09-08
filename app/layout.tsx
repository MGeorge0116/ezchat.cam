import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "EZChat.Cam",
  description: "Lightweight live video rooms with chat"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="main-wrap">
          <Header />
          <main className="main-content">{children}</main>
          <footer className="px-4 py-6 text-center text-xs opacity-70 border-t border-white/10">
            <div className="max-w-5xl mx-auto flex items-center justify-center gap-6">
              <a href="#" className="hover:underline">Donate</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
            <div className="mt-2 opacity-60">© 2025 EZChat.Cam. All Rights Reserved.</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
