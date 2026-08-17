

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saaterra.in';

  const aiBots = ['GPTBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'];

  const defaultDisallows = ['/go/', '/api/', '/admin/'];

  return {
    rules: [
      
      {
        userAgent: '*',
        allow: '/',
        disallow: defaultDisallows,
      },
      
      ...aiBots.map((bot) => ({
        userAgent: bot,
        allow: ['/', '/software/', '/category/', '/compare/'],
        disallow: defaultDisallows,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
