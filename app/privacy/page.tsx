// app/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-8 leading-relaxed select-none"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {/* Main Title */}
      <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>

      <p className="mb-4">
        EZChat.Cam (“EZChat”, “we”, “us”) values your privacy. This Privacy Policy explains how we
        collect, use, and protect your information when you use our Services.
      </p>

      <h2 className="font-bold mt-6 mb-2">1) Information We Collect</h2>
      <p className="mb-4">
        Account details such as username and email.
        <br />
        Usage data such as login times and active rooms.
        <br />
        Optional profile or presence information you choose to share.
      </p>

      <h2 className="font-bold mt-6 mb-2">2) How We Use Information</h2>
      <p className="mb-4">
        We use your information to provide and improve the Services, ensure security, and
        communicate updates or policy changes.
      </p>

      <h2 className="font-bold mt-6 mb-2">3) Sharing</h2>
      <p className="mb-4">
        We do not sell your personal information. Limited sharing may occur with trusted third
        parties (e.g., infrastructure providers).
      </p>

      <h2 className="font-bold mt-6 mb-2">4) Security</h2>
      <p className="mb-4">
        We use reasonable safeguards to protect your information. However, no online system is
        100% secure.
      </p>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
        Last Updated: 9/3/2025
      </p>
    </div>
  );
}
