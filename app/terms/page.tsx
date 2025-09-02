// app/terms/page.tsx
export const metadata = {
  title: "Terms of Service — EZChat.Cam",
  description: "Terms of Service for EZChat.Cam.",
};

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop: 16, paddingBottom: 24, maxWidth: 900 }}>
      <h1>Terms of Service</h1>

      <p style={{ marginTop: 12 }}>
        Welcome to EZChat.Cam (“EZChat”, “we”, “us”, “our”). These Terms of Service
        (“Terms”) are a legally binding agreement between you and EZChat and govern your access
        to and use of our website and Services. By using the Services, you agree to these Terms.
      </p>

      <h2 style={{ marginTop: 20 }}>1) Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material changes, we will post
        the updated Terms and update the “Last Updated” date. Your continued use of the Services
        after changes become effective constitutes acceptance of the updated Terms.
      </p>

      <h2 style={{ marginTop: 20 }}>2) Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age required by your local law) to use
        the Services. If you are under 18, you must have permission from a parent or legal guardian.
      </p>

      <h2 style={{ marginTop: 20 }}>3) Accounts</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>
          We reserve the right to suspend or terminate accounts that violate these Terms or applicable
          law, or that pose risk to users or our Services.
        </li>
      </ul>

      <h2 style={{ marginTop: 20 }}>4) Acceptable Use</h2>
      <p>When using EZChat, you agree that you will not:</p>
      <ul>
        <li>Violate any applicable law or regulation.</li>
        <li>Harass, threaten, or otherwise harm others.</li>
        <li>Post or stream content that is illegal, infringing, or otherwise prohibited.</li>
        <li>Attempt to interfere with or disrupt the Services or networks connected to the Services.</li>
        <li>Impersonate any person or misrepresent your affiliation with any person or entity.</li>
      </ul>

      <h2 style={{ marginTop: 20 }}>5) Content and Licenses</h2>
      <p>
        You retain ownership of the content you create and share on EZChat. By using the Services,
        you grant EZChat a worldwide, non-exclusive, royalty-free license to host, store, process,
        transmit, display, and distribute your content solely for the purpose of operating and
        improving the Services.
      </p>

      <h2 style={{ marginTop: 20 }}>6) Privacy</h2>
      <p>
        Our collection and use of personal information is described in our{" "}
        <a href="/privacy" className="link">Privacy Policy</a>. By using the Services, you agree
        that we can collect and use your information in accordance with that policy.
      </p>

      <h2 style={{ marginTop: 20 }}>7) Third-Party Services</h2>
      <p>
        The Services may rely on or link to third-party services (e.g., video infrastructure).
        We are not responsible for third-party content, policies, or practices.
      </p>

      <h2 style={{ marginTop: 20 }}>8) Disclaimers</h2>
      <p>
        THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW,
        EZCHAT DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, WITHOUT LIMITATION, IMPLIED
        WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
      </p>

      <h2 style={{ marginTop: 20 }}>9) Limitation of Liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, EZCHAT WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
        SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
        INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
      </p>

      <h2 style={{ marginTop: 20 }}>10) Termination</h2>
      <p>
        We may suspend or terminate your access to the Services at any time if we reasonably believe
        you have violated these Terms or applicable law, or to protect the security and integrity of
        the Services.
      </p>

      <h2 style={{ marginTop: 20 }}>11) Governing Law & Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of your local jurisdiction to the extent not preempted by
        applicable national law. Any disputes arising under these Terms will be resolved in a court of
        competent jurisdiction in the region where EZChat principally operates, unless otherwise required
        by law.
      </p>

      <h2 style={{ marginTop: 20 }}>12) Contact</h2>
      <p>
        Questions about these Terms? Contact us at <a href="mailto:support@ezchat.cam">support@ezchat.cam</a>.
      </p>

      <p style={{ marginTop: 20, opacity: 0.8 }}>Last Updated: {new Date().toLocaleDateString()}</p>
    </main>
  );
}
