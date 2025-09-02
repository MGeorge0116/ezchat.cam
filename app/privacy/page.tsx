// app/privacy/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — EZChat.Cam",
  description: "How EZChat.Cam collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1>Privacy Policy</h1>
      <p style={{ opacity: 0.9 }}>
        This Privacy Policy explains what information we collect when you use
        EZChat.Cam, how we use it, and the choices you have. It’s written to be
        clear and practical for our users.
      </p>

      <h2 style={{ marginTop: 20 }}>What we collect</h2>
      <ul>
        <li>
          <strong>Account info:</strong> username, email, and hashed password
          when you register.
        </li>
        <li>
          <strong>Usage info:</strong> basic logs needed to operate rooms
          (e.g., room name, join/leave timestamps, simplified device details).
        </li>
        <li>
          <strong>Directory thumbnails:</strong> opt-in snapshots from active
          webcams to show who’s live in a room. These are short-lived and
          periodically refreshed.
        </li>
        <li>
          <strong>Cookies:</strong> only what’s necessary for login sessions and
          site preferences.
        </li>
      </ul>

      <h2 style={{ marginTop: 20 }}>How we use information</h2>
      <ul>
        <li>Provide and secure video, chat, and room directory features.</li>
        <li>Maintain account sessions and prevent fraud/abuse.</li>
        <li>Improve reliability and performance.</li>
      </ul>

      <h2 style={{ marginTop: 20 }}>What we don’t do</h2>
      <ul>
        <li>No selling of your personal information.</li>
        <li>No ad tracking beacons.</li>
        <li>No unnecessary third-party analytics by default.</li>
      </ul>

      <h2 style={{ marginTop: 20 }}>Data retention</h2>
      <p style={{ opacity: 0.9 }}>
        We keep the minimum necessary to run the service. Directory thumbnails
        are cached briefly. Server logs are retained for operational
        troubleshooting and security, then deleted on a rolling basis.
      </p>

      <h2 style={{ marginTop: 20 }}>Security</h2>
      <p style={{ opacity: 0.9 }}>
        We use industry-standard practices to protect data in transit and at
        rest where applicable. Still, no online service can guarantee absolute
        security.
      </p>

      <h2 style={{ marginTop: 20 }}>Your choices</h2>
      <ul>
        <li>You can request access, correction, or deletion of your account.</li>
        <li>You can turn your camera off at any time.</li>
        <li>You can leave a room or log out to end your session.</li>
      </ul>

      <h2 style={{ marginTop: 20 }}>Children’s privacy</h2>
      <p style={{ opacity: 0.9 }}>
        EZChat.Cam is intended for users 13+ (or the age of digital consent in
        your region). If you believe a minor is using the service without
        permission, contact us so we can take appropriate action.
      </p>

      <h2 style={{ marginTop: 20 }}>Changes to this policy</h2>
      <p style={{ opacity: 0.9 }}>
        We may update this policy from time to time. Material changes will be
        highlighted on this page with a new “Last updated” date.
      </p>

      <h2 style={{ marginTop: 20 }}>Contact</h2>
      <p style={{ opacity: 0.9 }}>
        Questions about this policy? Email us at{" "}
        <a href="mailto:privacy@ezchat.cam">privacy@ezchat.cam</a>.
      </p>

      <p style={{ marginTop: 24, opacity: 0.7 }}>Last updated: {new Date().toLocaleDateString()}</p>
    </main>
  );
}
