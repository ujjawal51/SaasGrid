

export const metadata = {
  title: 'Privacy Policy — SaaTerra',
  description: 'Read SaaTerra Privacy Policy explaining how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs text-slate-300">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
          <p>
            When you visit SaaTerra, submit software reviews, or register an account, we may collect information including your name, email address, IP address, and browser session data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. How We Use Your Information</h2>
          <p>
            We use collected data to personalize your software discovery experience, authenticate user reviews, prevent spam submissions, and improve our AI recommendation engine.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Cookies &amp; Analytics</h2>
          <p>
            SaaTerra uses cookies and Google Analytics to monitor traffic patterns, maintain user sessions, and track affiliate referral link redirections securely.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Data Security &amp; Protection</h2>
          <p>
            We enforce HTTPS 256-bit encryption, HTTP-only JWT secure cookies, and strict MongoDB Atlas database access control to ensure all user data and invoice uploads remain safe and protected against unauthorized access.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-sky-500/30 bg-[#0d1c2e] p-5">
          <h2 className="text-base font-bold text-sky-400 flex items-center gap-2">
            <span>🛡️</span> 5. DPDP Act 2023 Compliance &amp; Personal Data Rights (Digital Personal Data Protection)
          </h2>
          <p className="text-slate-300 leading-relaxed">
            In full compliance with India&apos;s <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, SaaTerra acts as a Data Fiduciary and strictly respects user privacy:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
            <li>
              <strong className="text-white">Purpose Limitation:</strong> We collect personal data (Name, Email, Order IDs, Invoices, and UPI IDs) solely for the specific purpose of authenticating user reviews, processing cashback payouts, and preventing duplicate fraud.
            </li>
            <li>
              <strong className="text-white">Right to Correction &amp; Access:</strong> You have the right to request a summary of the personal data processed by SaaTerra and request correction of any inaccurate information.
            </li>
            <li>
              <strong className="text-white">Right to Erasure (Data Deletion):</strong> You may request the permanent deletion of your account, uploaded invoices, and UPI details at any time by contacting our Grievance Officer at <code className="text-sky-400">privacy@saaterra.in</code>.
            </li>
            <li>
              <strong className="text-white">Data Retention Policy:</strong> Invoice slips and verification hashes are retained strictly for the duration necessary for affiliate vendor audit settlements (up to 90 days), after which they are securely purged upon request.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">6. Data Protection &amp; Grievance Officer</h2>
          <p>
            For any privacy inquiries, consent withdrawal, or data erasure requests under the DPDP Act 2023, please contact our designated Grievance Officer:
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-1 text-slate-300">
            <p><strong>Officer:</strong> SaaTerra Data Privacy &amp; Compliance Team</p>
            <p><strong>Email:</strong> <a href="mailto:privacy@saaterra.in" className="text-sky-400 font-semibold underline">privacy@saaterra.in</a> / <a href="mailto:grievance@saaterra.in" className="text-sky-400 font-semibold underline">grievance@saaterra.in</a></p>
            <p><strong>Response Time:</strong> Within 48 business hours as mandated by Indian law.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
