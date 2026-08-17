import Link from 'next/link';

export const metadata = {
  title: 'All Software Categories Directory — SaaTerra',
  description:
    'Explore all software categories on SaaTerra. Find top-rated GST billing software, CRM, HR, accounting, AI tools, web hosting, and 20+ categories.',
};

const ALL_CATEGORIES = [
  { label_en: 'GST Billing & Invoicing', slug: 'billing-software', icon: '🧾', desc: 'Vyapaar, Tally, Zoho Books & GST billing tools' },
  { label_en: 'CRM & Sales Automation', slug: 'crm-software', icon: '📊', desc: 'TeleCRM, Salesforce, LeadSquared & sales CRM' },
  { label_en: 'HR & Payroll Management', slug: 'hr-payroll-software', icon: '👥', desc: 'Keka, GreytHR, Zoho People & salary tools' },
  { label_en: 'Accounting & Bookkeeping', slug: 'accounting-software', icon: '📒', desc: 'Busy, Marg ERP, QuickBooks & bookkeeping' },
  { label_en: 'Inventory & Warehouse', slug: 'inventory-software', icon: '📦', desc: 'Stock tracking, warehouse & order management' },
  { label_en: 'E-Commerce Platforms', slug: 'ecommerce-software', icon: '🛒', desc: 'Shopify, WooCommerce, Dukaan & online stores' },
  { label_en: 'AI Tools & Automation', slug: 'ai-tools', icon: '🤖', desc: 'ChatGPT, Copywriting, AI Video & Automation' },
  { label_en: 'Web Hosting & Cloud Servers', slug: 'web-hosting', icon: '🌐', desc: 'Hostinger, AWS, DigitalOcean & domain servers' },
  { label_en: 'Digital Marketing & SEO', slug: 'marketing-software', icon: '📣', desc: 'Semrush, Mailchimp, Meta Ads & SEO suites' },
  { label_en: 'Graphic & Video Design', slug: 'design-software', icon: '🎨', desc: 'Canva, Photoshop, Premiere Pro & UI design' },
  { label_en: 'Project Management & Tasks', slug: 'productivity-software', icon: '📁', desc: 'Jira, Asana, ClickUp, Notion & task boards' },
  { label_en: 'Customer Helpdesk & Support', slug: 'helpdesk-software', icon: '🎧', desc: 'Freshdesk, Zendesk, Intercom & live chat' },
  { label_en: 'Payment Gateways & Fintech', slug: 'payment-gateways', icon: '💳', desc: 'Razorpay, Cashfree, Stripe & UPI gateways' },
  { label_en: 'Security, VPN & Protection', slug: 'security-software', icon: '🛡️', desc: 'Antivirus, VPN, Cloud Security & Firewall' },
  { label_en: 'POS & Retail Management', slug: 'pos-software', icon: '🏪', desc: 'Retail billing counters, barcode & POS' },
  { label_en: 'ERP & Enterprise Suites', slug: 'erp-software', icon: '🏢', desc: 'SAP, Oracle, ERPNext & Enterprise suites' },
  { label_en: 'Cloud Storage & Drive Backup', slug: 'cloud-storage', icon: '☁️', desc: 'Google Drive, Dropbox, OneDrive & backup' },
  { label_en: 'Team Chat & Video Meetings', slug: 'communication-software', icon: '💬', desc: 'Zoom, Slack, MS Teams & Meeting tools' },
  { label_en: 'Form Builders & Surveys', slug: 'form-builders', icon: '📝', desc: 'Typeform, Google Forms, Jotform & surveys' },
  { label_en: 'Email Marketing & Drip Mail', slug: 'email-marketing', icon: '📧', desc: 'Brevo, ActiveCampaign, MailerLite & drip mail' },
];

export default function CategoryDirectoryPage() {
  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-200 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-400">
            <span>📚 Complete Taxonomy</span>
            <span>·</span>
            <span>20 Categories</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Browse All Software Categories
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Find the exact software category for your business needs. Compare tools, real ratings, pricing, and cashback deals.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {ALL_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-[#0d1c2e] p-5 shadow-xl hover:border-sky-500 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-200"
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-2xl shadow-inner group-hover:border-sky-500/50 group-hover:bg-sky-500/10 transition-colors">
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                    {cat.label_en}
                  </h2>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-sky-400 group-hover:text-sky-300">
                <span>View Software</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
