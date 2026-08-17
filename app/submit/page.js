import Link from 'next/link';
import SubmitForm from './_components/SubmitForm';

export const metadata = {
  title: 'Submit Software | SaaTerra',
  description: 'List your SaaS tool or software product on SaaTerra to reach thousands of Indian business buyers.',
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-3xl py-8 space-y-8">
      {}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-slate-300">Submit Software</span>
      </nav>

      {}
      <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-3xl">
          🚀
        </div>
        <h1 className="text-2xl font-extrabold text-white">
          List Your Software on <span className="text-sky-400">SaaTerra</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Get discovered by Indian businesses, shop owners, and creators actively searching for SaaS software.
        </p>
      </div>

      <SubmitForm />
    </div>
  );
}
