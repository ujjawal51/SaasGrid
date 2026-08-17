

import Script from 'next/script';
import Link from 'next/link';
import './globals.css';
import { getAuthUser } from '@/lib/auth';
import Navbar from './_components/Navbar';
import AIChatBot from './_components/AIChatBot';
import AuthPromptModal from './_components/AuthPromptModal';
import AnalyticsTracker from './_components/AnalyticsTracker';
import { LangProvider } from '@/context/LangContext';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import AnnouncementBanner from './_components/AnnouncementBanner';
import Footer from './_components/Footer';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export const metadata = {

  title: {
    default: 'SaaTerra — Discover & Compare Best SaaS Tools for Indian Businesses',
    template: '%s | SaaTerra',
  },
  description:
    'SaaTerra is India\'s leading SaaS discovery platform. Compare billing software, CRM, HR tools, and more — with real reviews, pricing, and side-by-side comparisons.',

  metadataBase: new URL('https://www.saaterra.in'),
  alternates: { canonical: '/' },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.saaterra.in',
    siteName: 'SaaTerra',
    title: 'SaaTerra — Discover & Compare Best SaaS Tools',
    description:
      'Find, compare, and choose the right SaaS software for your business. Real reviews, transparent pricing, and expert comparisons.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SaaTerra — SaaS Discovery Platform',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@saaterra',
    creator: '@saaterra',
    title: 'SaaTerra — Discover & Compare Best SaaS Tools',
    description:
      'India\'s SaaS discovery platform. Compare tools, read reviews, and find what fits your business.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};



export default async function RootLayout({ children }) {
  const user = await getAuthUser();
  let siteConfig = null;
  try {
    await dbConnect();
    const rawConfig = await SiteConfig.findOne({ key: 'global' }).lean();
    if (rawConfig) {
      siteConfig = JSON.parse(JSON.stringify(rawConfig));
    }
  } catch { }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        
        {/* Global JSON-LD Schema: Organization & WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'SaaTerra',
                url: 'https://www.saaterra.in',
                logo: 'https://www.saaterra.in/logo-white.png',
                description: "India's Leading B2B SaaS Discovery, Software Comparison & Cashback Platform.",
                sameAs: [
                  'https://twitter.com/saaterra',
                  'https://www.linkedin.com/company/saaterra',
                ],
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'SaaTerra',
                url: 'https://www.saaterra.in',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://www.saaterra.in/search?q={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
            ]),
          }}
        />
      </head>
      <body className="bg-[#0B192C] text-slate-200 font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <LangProvider>

          {/* Global Announcement Banner */}
          <AnnouncementBanner config={siteConfig} />

          { }
          {GA_ID && (
            <>
              { }
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
              />
              { }
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: true,
                });
              `}
              </Script>
            </>
          )}

          {/* Main Top Navigation */}
          <Navbar user={user} />

          { }
          { }
          <div
            className="flex-1 w-full"
            style={{
              backgroundImage: `
              linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)
            `,
              backgroundSize: '48px 48px',
            }}
          >
            { }
            <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning>
              {children}
            </main>
          </div>

          { }
          <Footer />

          { }
          <AnalyticsTracker />

          {/* AI Chatbot Assistant */}
          <AIChatBot user={user} />

          {/* Periodic Auto Login/Signup Prompt Modal for Logged-Out Users */}
          <AuthPromptModal user={user} />

        </LangProvider>
      </body>
    </html>
  );
}
