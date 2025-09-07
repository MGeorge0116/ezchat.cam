// File: components/shared/SiteFooter.tsx
export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 text-xs">
      <div className="max-w-7xl mx-auto w-full px-4 py-4 flex items-center justify-center gap-6 flex-wrap text-white/60">
        {/* Non-clickable Donate */}
        <span className="px-2 py-1 rounded cursor-not-allowed opacity-60 select-none">Donate</span>
        <a className="hover:text-white/80" href="/privacy">Privacy Policy</a>
        <a className="hover:text-white/80" href="/terms">Terms of Service</a>
      </div>
      <div className="text-center pb-4 text-white/60">
        © {new Date().getFullYear()} EZChat.Cam. All Rights Reserved.
      </div>
    </footer>
  );
}
