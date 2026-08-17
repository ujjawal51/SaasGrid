import Link from 'next/link';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import ReviewForm from './_components/ReviewForm';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams['software-slug'];

  try {
    await dbConnect();
    const software = await Software.findOne({ slug }).select('name').lean();
    if (!software) return { title: 'Software Not Found | SaaTerra' };

    return {
      title: `Write a Review for ${software.name} | SaaTerra`,
      description: `Share your honest experience and review for ${software.name} on SaaTerra.`,
    };
  } catch {
    return { title: 'Write Review | SaaTerra' };
  }
}

export default async function WriteReviewPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams['software-slug'];

  await dbConnect();
  const software = await Software.findOne({ slug }).select('name slug logo categorySlug').lean();

  if (!software) notFound();

  return (
    <div className="mx-auto max-w-3xl py-8 space-y-8">
      {}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sky-400 transition-colors">Home</Link>
        <span>›</span>
        <Link href={`/software/${software.slug}`} className="hover:text-sky-400 transition-colors">{software.name}</Link>
        <span>›</span>
        <span className="text-slate-300">Write a Review</span>
      </nav>

      {/* Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-6 text-center space-y-3 shadow-xl">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/60 p-2.5 shadow-xl backdrop-blur-md overflow-hidden">
          {software.logo?.startsWith('http') ? (
            <img
              src={software.logo}
              alt={`${software.name} logo`}
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain drop-shadow-md"
            />
          ) : software.logo && software.logo.length <= 4 ? (
            <span className="text-3xl">{software.logo}</span>
          ) : (
            <span className="font-extrabold text-white text-2xl">{software.name[0]}</span>
          )}
        </div>
        <h1 className="text-2xl font-black text-white">
          Review <span className="text-sky-400">{software.name}</span>
        </h1>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Help thousands of Indian businesses make better decisions. Share your honest feedback, pros, and cons.
        </p>
      </div>

      {}
      <ReviewForm softwareSlug={software.slug} softwareName={software.name} />
    </div>
  );
}
