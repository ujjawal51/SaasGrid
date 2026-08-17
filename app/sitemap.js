import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import Blog from '@/models/Blog';

const ALL_CATEGORY_SLUGS = [
  'billing-software',
  'crm-software',
  'hr-payroll-software',
  'accounting-software',
  'inventory-software',
  'ecommerce-software',
  'ai-tools',
  'web-hosting',
  'marketing-software',
  'design-software',
  'productivity-software',
  'helpdesk-software',
  'payment-gateways',
  'security-software',
  'pos-software',
  'erp-software',
  'cloud-storage',
  'communication-software',
  'form-builders',
  'email-marketing',
];

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';

  // 1. Core Static Pages
  const staticRoutes = [
    '',
    '/software',
    '/category',
    '/compare',
    '/blog',
    '/submit',
    '/cashback',
    '/about',
    '/contact',
    '/disclosure',
    '/privacy',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/software' || route === '/blog' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/software' || route === '/category' || route === '/blog' ? 0.9 : 0.7,
  }));

  // 2. All 20 Category Hub Pages
  const categoryRoutes = ALL_CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Dynamic Software Profile Pages from MongoDB
  let softwareRoutes = [];
  // 4. Dynamic Blog Article Pages from MongoDB
  let blogRoutes = [];

  try {
    await dbConnect();
    const [softwareList, blogList] = await Promise.all([
      Software.find({}).select('slug updatedAt').lean(),
      Blog.find({ isPublished: true }).select('slug updatedAt createdAt').lean(),
    ]);

    softwareRoutes = softwareList.map((sw) => ({
      url: `${baseUrl}/software/${sw.slug}`,
      lastModified: sw.updatedAt ? new Date(sw.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.95,
    }));

    blogRoutes = blogList.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));
  } catch (error) {
    console.error('[sitemap.js] DB Query Error:', error.message);
  }

  // 5. Popular Comparison Matrix Pages
  const popularComparisons = [
    'vyapaar-app-vs-telecrm',
    'hostinger-india-vs-vyapaar-app',
    'keka-hr-vs-telecrm',
    'vyapaar-app-vs-keka-hr',
    'notion-vs-clickup',
    'shopify-vs-woocommerce',
    'telecrm-vs-leadsquared',
    'zoho-books-vs-tally',
  ].map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...categoryRoutes, ...softwareRoutes, ...blogRoutes, ...popularComparisons];
}
