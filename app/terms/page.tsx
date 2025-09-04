// app/terms/page.tsx
export default function TermsPage() {
  return (
    <div
      className="max-w-4xl mx-auto px-4 py-8 leading-relaxed select-none"
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {/* Main Title */}
      <h1 className="text-3xl font-bold text-center mb-8">Terms of Service</h1>

      <p className="mb-4">
        EZChat.Cam (“EZChat”, “we”, “us”, “our”) provides group video chat and other
        online audio, video broadcasting and communication services for individuals,
        businesses, and organizations (the “Services”) through our website
        <a href="https://ezchat.cam" className="text-blue-500 underline"> www.ezchat.cam</a>.
        These Terms of Service (“Terms”) govern your access to and use of the Site and Services,
        and constitute a binding legal agreement between you and EZChat.
      </p>

      <p className="mb-4">
        YOU ACKNOWLEDGE AND AGREE THAT, BY ACCESSING OR USING THE SITE OR THE SERVICES OR BY
        POSTING, BROADCASTING, OR STREAMING ANY CONTENT, YOU ARE INDICATING THAT YOU HAVE READ,
        UNDERSTAND, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE. IF YOU DO NOT AGREE TO THESE
        TERMS, THEN YOU HAVE NO RIGHT TO ACCESS OR USE THE SITE OR SERVICES.
      </p>

      <h2 className="font-bold mt-6 mb-2">1) Modification</h2>
      <p className="mb-4">
        We reserve the right, at our sole discretion, to modify, discontinue, or terminate the
        Site or Services, or to modify these Terms of Service at any time without prior notice.
        If we modify these Terms, we will update the “Last Updated Date” at the top of this page.
        By continuing to use the Site or Services after modifications, you agree to be bound by
        the revised Terms.
      </p>

      <h2 className="font-bold mt-6 mb-2">2) Eligibility</h2>
      <p className="mb-4">
        The Site and Services are intended solely for persons who are 18 or older. By accessing
        or using the Services, you represent and warrant that you are 18 or older. If you are
        under 18, you may not use the Services without parental or legal guardian consent.
      </p>

      <h2 className="font-bold mt-6 mb-2">3) Account Registration</h2>
      <p className="mb-4">
        To access certain features, you must register for an account. You agree to provide
        accurate, current, and complete information during registration and keep it up-to-date.
        You are responsible for safeguarding your password and all activities under your account.
        EZChat reserves the right to suspend or terminate accounts with false or incomplete
        information.
      </p>

      {/* ...continue with rest of sections... */}

    </div>
  );
}
