/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix: turbopack root for projects outside the default Git root (e.g., OneDrive paths)
  turbopack: {
    root: __dirname,
  },

  // Allow external image domains (for software logo URLs)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
