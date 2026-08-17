

export const metadata = {
  title: 'Affiliate & Advertising Disclosure — SaaTerra',
  description: 'Read SaaTerra Affiliate & Advertising Disclosure policy regarding affiliate links and vendor partnerships.',
};

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs text-slate-300">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white">Affiliate &amp; Advertising Disclosure</h1>
        <p className="text-slate-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Affiliate Referral Links</h2>
          <p>
            Some links on SaaTerra are affiliate links. If you click on an affiliate link and purchase a subscription or sign up for a paid plan, SaaTerra may receive a referral commission at zero extra cost to you.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Editorial Independence &amp; Rating Integrity</h2>
          <p>
            Our affiliate partnerships never influence our editorial ratings, star scores, or pros &amp; cons evaluations. All software reviews are submitted by real verified users or evaluated objectively by our data team.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Cloaked Gateway Routing</h2>
          <p>
            Outbound links routing through <code className="text-sky-400">/go/[software-slug]</code> track referral analytics securely while maintaining sub-second redirection speeds to vendor websites.
          </p>
        </section>
      </div>
    </div>
  );
}
