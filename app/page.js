

import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import HomePageClient from './_components/HomePageClient';

export const metadata = {
  title: 'SaaTerra — Find & Compare the Best SaaS Tools for Indian Businesses',
  description:
    "SaaTerra is India's #1 SaaS discovery platform. Compare billing software, CRM, HR tools, and 500+ more — with real reviews, pricing, and side-by-side comparisons.",
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getTopTools() {
  try {
    await dbConnect();
    const tools = await Software.find({})
      .sort({ isTopRated: -1, averageRating: -1, totalReviews: -1 })
      .select('name slug logo tagline categorySlug pricingType startingPrice billingCycle averageRating totalReviews isTopRated isFeatured featuredBadge cashbackActive cashbackType cashbackValue cashbackLabel')
      .lean();
    return JSON.parse(JSON.stringify(tools));
  } catch (err) {
    console.error('[page.js] getTopTools failed:', err.message);
    return [];
  }
}

export default async function HomePage() {
  const topTools = await getTopTools();
  return <HomePageClient topTools={topTools} />;
}
