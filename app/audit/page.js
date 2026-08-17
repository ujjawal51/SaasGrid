import StackAuditTool from './_components/StackAuditTool';

export const metadata = {
  title: 'Free SaaS Stack Health & Waste Audit — Cut Unused Software Costs | SaaTerra',
  description:
    'Free SaaS Stack Audit Tool for Indian businesses, startups, and agencies. Scan your active subscriptions, detect duplicate tools, and unlock guaranteed cashback savings in INR.',
};

export default function AuditPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <StackAuditTool />
    </main>
  );
}
