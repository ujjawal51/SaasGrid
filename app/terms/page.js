

export const metadata = {
  title: 'Terms of Service — SaaTerra',
  description: 'Read the Terms of Service governing user reviews, content guidelines, brand protection, and platform usage on SaaTerra.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs text-slate-300">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-8 leading-relaxed">
        {}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
          <p className="text-slate-400">
            By accessing or using SaaTerra.in (&quot;the Platform&quot;), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not access or use our platform.
          </p>
        </section>

        {}
        <section className="space-y-4 rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6">
          <h2 className="text-base font-bold text-sky-400 flex items-center gap-2">
            <span>🛡️</span>
            <span>2. User Reviews &amp; Content Moderation Policy / समीक्षा नीति (English &amp; हिंदी)</span>
          </h2>

          {}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-200">English Terms:</p>
            <p className="text-slate-300">
              SaaTerra is committed to maintaining an authentic, objective, and respectful software review community. By submitting any review or content on this website, you explicitly agree that:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
              <li>
                <strong className="text-white">Strict Prohibition of Abusive Language:</strong> The use of abusive language, hate speech, profanity, vulgarity, or personal insults is strictly prohibited.
              </li>
              <li>
                <strong className="text-white">Prohibition of Unverified Brand Defamation:</strong> Defaming, disparaging, or posting malicious negative reviews about any software vendor or brand without verified proof of actual usage is strictly forbidden.
              </li>
              <li>
                <strong className="text-white">Right to Delete Suspicious Data:</strong> SaaTerra reserves the absolute right, at its sole discretion, to flag, reject, edit, or permanently delete any suspicious, fake, unverified, or abusive review data without prior notice.
              </li>
            </ul>
          </div>

          {}
          <div className="space-y-2 border-t border-slate-700/80 pt-4">
            <p className="text-xs font-bold text-emerald-400">हिंदी नियम (Hindi Terms):</p>
            <p className="text-slate-300 leading-relaxed">
              हमारी वेबसाइट (SaaTerra.in) पर निष्पक्ष और सुरक्षित समीक्षा माहौल बनाए रखने के लिए निम्नलिखित नियम अनिवार्य हैं:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2 leading-relaxed">
              <li>
                <strong className="text-emerald-300">गाली-गलौज और अभद्र भाषा पर रोक:</strong> हमारी वेबसाइट पर किसी भी प्रकार की अभद्र भाषा, गाली-गलौज या अपमानजनक शब्दों का प्रयोग पूरी तरह से प्रतिबंधित (strictly prohibited) है।
              </li>
              <li>
                <strong className="text-emerald-300">बिना प्रमाण ब्रांड बदनाम करने पर प्रतिबंध:</strong> बिना किसी सत्यापित प्रमाण के किसी भी सॉफ्टवेयर ब्रांड (जैसे Vyapar, Hostinger आदि) को बदनाम करना या फर्जी नकारात्मक समीक्षा पोस्ट करना सख्त मना है।
              </li>
              <li>
                <strong className="text-emerald-300">डेटा डिलीट करने का अधिकार:</strong> हम किसी भी संदिग्ध (suspicious), फर्जी या अभद्र समीक्षा के डेटा को बिना किसी पूर्व सूचना के डिलीट/हटाने का पूर्ण अधिकार रखते हैं।
              </li>
            </ul>
          </div>
        </section>

        {}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Trademarks &amp; Intellectual Property</h2>
          <p className="text-slate-400">
            All software brand names, logos, trademarks, and registered assets displayed on SaaTerra.in (such as Vyapar, Hostinger, Zapier, Notion, etc.) belong strictly to their respective owners. SaaTerra claims no ownership over third-party trademarks and displays them solely under fair-use principles for educational, review, and comparison purposes.
          </p>
        </section>

        {}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Affiliate Referral Links</h2>
          <p className="text-slate-400">
            Certain links on this website are affiliate referral links. If you click on an affiliate link and complete a purchase or subscription, SaaTerra may earn a referral commission at zero additional cost to you.
          </p>
        </section>

        {}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Limitation of Liability</h2>
          <p className="text-slate-400">
            SaaTerra provides software comparison data and user reviews for informational purposes only. We do not guarantee pricing accuracy, uptime, or vendor feature changes. Users are advised to verify details directly on official vendor websites before making purchasing decisions.
          </p>
        </section>
      </div>
    </div>
  );
}
