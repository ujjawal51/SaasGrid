/**
 * script/seedData.js
 *
 * Standalone MongoDB seed script for SaaTerra.
 * Seeds 20 real Software catalog entries + User Written Reviews.
 * Covers ALL schema fields: cashback, coupons, featured, SEO, pros/cons, etc.
 *
 * Usage:
 *   node script/seedData.js           (clears existing data, then seeds)
 *   node script/seedData.js --append  (adds without deleting existing)
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const IS_APPEND  = process.argv.includes('--append');

if (!MONGODB_URI) {
  console.error('\n❌ MONGODB_URI not found in .env.local\n');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline schemas (mirrors models/Software.js and models/Review.js exactly)
// ─────────────────────────────────────────────────────────────────────────────
const SoftwareSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, unique: true, trim: true },
    slug:             { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo:             { type: String, default: null },
    screenshots:      { type: [String], default: [] },
    tagline:          { type: String, required: true, trim: true },
    description:      { type: String, required: true },
    categorySlug:     { type: String, required: true, lowercase: true, trim: true },
    pricingType:      { type: String, enum: ['Free', 'Paid', 'Freemium'], default: null },
    startingPrice:    { type: Number, default: null },
    billingCycle:     { type: String, enum: ['Monthly', 'Yearly', 'One-time'], default: null },
    affiliateLink:    { type: String, required: true },
    pros:             { type: [String], default: [] },
    cons:             { type: [String], default: [] },
    averageRating:    { type: Number, default: 0 },
    totalReviews:     { type: Number, default: 0 },
    upvotes:          { type: Number, default: 0 },
    isTopRated:       { type: Boolean, default: false },
    isFeatured:       { type: Boolean, default: false },
    featuredBadge:    { type: String, default: "🔥 Editor's Choice" },
    couponCode:       { type: String, default: null },
    couponDiscount:   { type: String, default: null },
    couponLabel:      { type: String, default: 'EXCLUSIVE COUPON' },
    couponExpiry:     { type: String, default: null },
    couponActive:     { type: Boolean, default: false },
    cashbackActive:   { type: Boolean, default: true },
    cashbackType:     { type: String, enum: ['flat', 'percentage'], default: 'flat' },
    cashbackValue:    { type: Number, default: 400 },
    cashbackLabel:    { type: String, default: 'Buy via SaaTerra & claim your cashback instantly' },
    cashbackValidity: { type: String, default: '' },
    metaTitle:        { type: String, default: null },
    metaDescription:  { type: String, default: null },
    metaKeywords:     { type: String, default: null },
  },
  { timestamps: true }
);


const ReviewSchema = new mongoose.Schema(
  {
    softwareId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Software', required: true },
    userName:        { type: String, required: true },
    userDesignation: { type: String },
    rating:          { type: Number, required: true },
    reviewTitle:     { type: String, required: true },
    feedbackPros:    { type: String, required: true },
    feedbackCons:    { type: String, required: true },
    isVerified:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Software = mongoose.models.Software || mongoose.model('Software', SoftwareSchema);
const Review   = mongoose.models.Review   || mongoose.model('Review', ReviewSchema);

// ─────────────────────────────────────────────────────────────────────────────
// SEED DATA — 20 Real Popular SaaS Tools
// ─────────────────────────────────────────────────────────────────────────────
const SEED_DATA = [

  // ── 1. Notion ─────────────────────────────────────────────────────────────
  {
    name:           'Notion',
    slug:           'notion',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
    screenshots:    [],
    tagline:        'All-in-one workspace for notes, docs, projects & wikis',
    description:    '<p>Notion is the ultimate connected workspace for teams and individuals. It combines notes, documents, project management, and wikis into one highly customizable platform. With AI features, databases, and powerful integrations, Notion helps teams from startups to enterprises stay organized and move faster. Used by over 35 million people worldwide including teams at Pixar, Headspace, and Nike.</p>',
    categorySlug:   'productivity',
    pricingType:    'Freemium',
    startingPrice:  10,
    billingCycle:   'Monthly',
    affiliateLink:  'https://notion.so',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  '⭐ Most Popular',
    upvotes:        4820,
    averageRating:  4.7,
    totalReviews:   21500,
    couponActive:   true,
    couponCode:     'SAATERRA20',
    couponDiscount: '20% OFF',
    couponLabel:    'EXCLUSIVE COUPON',
    couponExpiry:   '2025-12-31',
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  500,
    cashbackLabel:  'Buy via SaaTerra & get ₹500 cashback instantly',
    cashbackValidity: 'Valid on annual plans only',
    metaTitle:      'Notion Review & Cashback | SaaTerra — Best Workspace Tool 2025',
    metaDescription: 'Get Notion via SaaTerra and earn ₹500 cashback. All-in-one notes, wiki, projects & docs platform. Best deal for teams and startups.',
    metaKeywords:   'notion review, notion cashback, notion discount, notion india',
    pros: [
      'Extremely flexible — databases, wikis, notes, and task boards all in one',
      'Notion AI assists in writing, summarising, and brainstorming',
      'Generous free plan perfect for individual users and small teams',
      'Cross-platform sync — web, Mac, Windows, iOS, Android',
    ],
    cons: [
      'Steep learning curve for new users coming from simpler tools',
      'Offline mode is limited — requires internet for most features',
    ],
    reviews: [
      {
        userName:        'Arjun Singh',
        userDesignation: 'Product Manager, Bangalore Startup',
        rating: 5,
        reviewTitle:     'Replaced 4 different tools with just Notion!',
        feedbackPros:    'We moved our entire product roadmap, sprint planning, meeting notes, and company wiki to Notion. The linked databases are incredibly powerful once you get the hang of them. The AI writing assistant saves me at least 1 hour per day.',
        feedbackCons:    'First week felt overwhelming. Notion is so flexible that you can spend too much time perfecting the system instead of doing actual work.',
      },
      {
        userName:        'Priya Nair',
        userDesignation: 'Content Strategist, Freelancer (Mumbai)',
        rating: 5,
        reviewTitle:     'Best tool for content planning and editorial calendar',
        feedbackPros:    'I manage content calendars for 6 clients inside Notion. Gallery views for blog content and Kanban for status tracking are perfect. The free plan is genuinely useful.',
        feedbackCons:    'Exporting to PDF sometimes loses formatting on complex tables.',
      },
    ],
  },

  // ── 2. Canva ──────────────────────────────────────────────────────────────
  {
    name:           'Canva',
    slug:           'canva',
    logo:           'https://upload.wikimedia.org/wikipedia/en/3/3b/Canva_Logo.png',
    screenshots:    [],
    tagline:        'Design anything — social media, presentations, logos & more',
    description:    '<p>Canva is the world\'s leading online graphic design platform used by over 170 million people across 190 countries. With thousands of professional templates, drag-and-drop tools, and Brand Kit features, Canva empowers everyone from solo creators to enterprise marketing teams to create stunning visuals without any design background. Canva Pro unlocks a powerful background remover, magic resize, premium assets, and team collaboration features.</p>',
    categorySlug:   'design-tools',
    pricingType:    'Freemium',
    startingPrice:  499,
    billingCycle:   'Monthly',
    affiliateLink:  'https://canva.com',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  '🏆 Top Rated',
    upvotes:        5890,
    averageRating:  4.8,
    totalReviews:   48200,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  400,
    cashbackLabel:  'Buy Canva Pro via SaaTerra & earn ₹400 cashback',
    cashbackValidity: 'Valid on Pro annual plan',
    metaTitle:      'Canva Pro Review & Cashback Deal | SaaTerra 2025',
    metaDescription: 'Get Canva Pro via SaaTerra and earn ₹400 cashback. Best graphic design tool for social media, presentations, and marketing.',
    metaKeywords:   'canva pro review, canva cashback, canva discount india, canva pro deal',
    pros: [
      'Thousands of professionally designed templates across all categories',
      'Brand Kit to keep logos, fonts, and colours consistent across designs',
      'Background Remover removes image backgrounds in one click (Pro)',
      'Magic Resize converts one design across multiple platforms instantly',
      'Real-time team collaboration and commenting',
    ],
    cons: [
      'Advanced photo editing is limited compared to Adobe Photoshop',
      'Downloaded files can sometimes be slightly lower quality on free plan',
    ],
    reviews: [
      {
        userName:        'Sneha Kapoor',
        userDesignation: 'Social Media Manager, Delhi',
        rating: 5,
        reviewTitle:     'Canva Pro is worth every rupee for a social media manager',
        feedbackPros:    'I create Instagram posts, YouTube thumbnails, pitch decks and email banners all inside Canva. The Magic Resize tool alone saves me 2 hours per week. Brand Kit keeps all my client designs consistent.',
        feedbackCons:    'Would love more advanced typography controls like kerning adjustments.',
      },
      {
        userName:        'Amit Tiwari',
        userDesignation: 'Co-Founder, D2C Brand (Ahmedabad)',
        rating: 5,
        reviewTitle:     'Our entire marketing team uses Canva — no designer needed',
        feedbackPros:    'Our whole non-designer team creates product ads, packaging mockups, and investor decks without any external design agency. Saved us ₹40,000/month in design costs.',
        feedbackCons:    'Canva AI image generation quality is still improving — not Midjourney level yet.',
      },
    ],
  },

  // ── 3. Semrush ────────────────────────────────────────────────────────────
  {
    name:           'Semrush',
    slug:           'semrush',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/8/8e/SEMrush_icon.svg',
    screenshots:    [],
    tagline:        'All-in-one SEO, content & competitive intelligence platform',
    description:    '<p>Semrush is the industry-leading all-in-one digital marketing platform trusted by over 10 million marketers, SEO professionals, and agencies worldwide. It provides powerful tools for keyword research, competitor analysis, site audits, backlink analytics, rank tracking, content marketing, social media, and PPC research — all from a single unified dashboard. Semrush is the go-to tool for professionals looking to dominate search engine rankings.</p>',
    categorySlug:   'seo-tools',
    pricingType:    'Paid',
    startingPrice:  11700,
    billingCycle:   'Monthly',
    affiliateLink:  'https://semrush.com',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  "🔥 Editor's Choice",
    upvotes:        3240,
    averageRating:  4.6,
    totalReviews:   16800,
    couponActive:   true,
    couponCode:     'TERRA14',
    couponDiscount: '14-Day Free Trial',
    couponLabel:    'FREE TRIAL',
    couponExpiry:   '2025-12-31',
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  1500,
    cashbackLabel:  'Get ₹1500 cashback on Semrush Pro plan via SaaTerra',
    cashbackValidity: 'Valid on first month of Pro/Guru plan',
    metaTitle:      'Semrush Review, Coupon & Cashback | SaaTerra — Save ₹1500',
    metaDescription: 'Get Semrush via SaaTerra and earn ₹1500 cashback + 14-day free trial. Best SEO tool for keyword research, site audit and competitor analysis.',
    metaKeywords:   'semrush review, semrush coupon, semrush cashback, semrush india, semrush discount 2025',
    pros: [
      'Largest keyword database — 26.1 billion keywords across all niches',
      'Competitor traffic and keyword gap analysis is unmatched',
      'Built-in SEO writing assistant for real-time content optimisation',
      'Site audit crawls up to 100,000 pages with actionable fix recommendations',
    ],
    cons: [
      'Pricing is steep for individual bloggers and micro-businesses',
      'Data export limits on lower plans can be restrictive for large agencies',
    ],
    reviews: [
      {
        userName:        'Rahul Gupta',
        userDesignation: 'SEO Lead, Digital Agency (Noida)',
        rating: 5,
        reviewTitle:     'Nothing beats Semrush for competitor keyword research',
        feedbackPros:    'The Keyword Gap and Traffic Analytics tools helped us identify exactly which keywords our client\'s competitors were ranking for. We grew organic traffic by 180% in 4 months using Semrush data.',
        feedbackCons:    'The learning curve for newer team members can take 2-3 weeks. So many features that it can be overwhelming initially.',
      },
    ],
  },

  // ── 4. Figma ──────────────────────────────────────────────────────────────
  {
    name:           'Figma',
    slug:           'figma',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg',
    screenshots:    [],
    tagline:        'Collaborative interface design and prototyping tool for teams',
    description:    '<p>Figma is the industry-standard collaborative UI/UX design and prototyping tool used by over 4 million designers at companies like Microsoft, Airbnb, Twitter, and Dropbox. It runs entirely in the browser, enabling real-time collaboration where multiple designers can work simultaneously on the same file. Figma includes powerful vector design tools, interactive prototyping, a component library system, Dev Mode for developer handoff, and FigJam for whiteboarding.</p>',
    categorySlug:   'design-tools',
    pricingType:    'Freemium',
    startingPrice:  1250,
    billingCycle:   'Monthly',
    affiliateLink:  'https://figma.com',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  "🎨 Designers' Choice",
    upvotes:        4450,
    averageRating:  4.8,
    totalReviews:   24700,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  550,
    cashbackLabel:  'Buy Figma Professional via SaaTerra & get ₹550 cashback',
    cashbackValidity: 'Valid on annual Professional team plan',
    metaTitle:      'Figma Review & Cashback | SaaTerra — Best UI/UX Design Tool 2025',
    metaDescription: 'Get Figma via SaaTerra and earn ₹550 cashback. Best collaborative UI/UX design and prototyping tool. Used by 4M+ designers worldwide.',
    metaKeywords:   'figma review, figma cashback, figma india, best ui ux design tool',
    pros: [
      'Real-time multi-user collaboration — entire team designs simultaneously',
      'Browser-based — no installation, works on any OS including Linux',
      'Auto Layout and component variants reduce design-to-developer handoff errors',
      'Dev Mode generates accurate CSS, iOS, and Android code from designs',
    ],
    cons: [
      'Heavy files with many components can slow down browser performance',
      'Offline support is still limited compared to desktop-native tools',
    ],
    reviews: [
      {
        userName:        'Ishaan Chopra',
        userDesignation: 'Senior Product Designer, FinTech (Bengaluru)',
        rating: 5,
        reviewTitle:     'Figma transformed how our design and engineering teams collaborate',
        feedbackPros:    'Our developers can inspect exact CSS values, spacing, and colours directly from Figma without us exporting anything. Real-time collaboration means no more "final_v2_ACTUAL.sketch" files. The component system keeps our design consistent across 50+ screens.',
        feedbackCons:    'Loading large files with 200+ frames can be slow on older laptops.',
      },
    ],
  },

  // ── 5. Slack ──────────────────────────────────────────────────────────────
  {
    name:           'Slack',
    slug:           'slack',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    screenshots:    [],
    tagline:        'Where work happens — team messaging and collaboration hub',
    description:    '<p>Slack is the world\'s most popular team communication and collaboration platform, used by over 20 million daily active users from startups to Fortune 500 companies. It organises conversations into channels, supports rich integrations with 2,400+ apps, and offers powerful search, threads, Huddles (lightweight audio/video), and workflow automation tools. Slack transforms chaotic email chains into organised, searchable, and productive team conversations.</p>',
    categorySlug:   'productivity',
    pricingType:    'Freemium',
    startingPrice:  750,
    billingCycle:   'Monthly',
    affiliateLink:  'https://slack.com',
    isFeatured:     false,
    isTopRated:     true,
    featuredBadge:  '⭐ Most Popular',
    upvotes:        3680,
    averageRating:  4.6,
    totalReviews:   32100,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  450,
    cashbackLabel:  'Buy Slack Pro via SaaTerra & get ₹450 cashback',
    cashbackValidity: 'Valid on Pro annual plan',
    metaTitle:      'Slack Review & Cashback | SaaTerra — Best Team Communication Tool',
    metaDescription: 'Get Slack via SaaTerra and earn ₹450 cashback. Best team messaging app for startups and remote teams.',
    metaKeywords:   'slack review, slack cashback, slack india, slack pro deal, team communication tool',
    pros: [
      'Organised channels keep conversations structured by topic or project',
      '2,400+ app integrations — connects GitHub, Jira, Google Drive, and more',
      'Slack Huddles — lightweight voice/video calls without scheduling overhead',
      'Powerful message search across entire team history',
    ],
    cons: [
      'Free plan limits message history to 90 days — can lose important context',
      'Notification overload is real if channels are not properly managed',
    ],
    reviews: [
      {
        userName:        'Rohan Mehta',
        userDesignation: 'Engineering Lead, SaaS Startup (Pune)',
        rating: 5,
        reviewTitle:     'Completely eliminated internal email for our 25-person team',
        feedbackPros:    'We have channels for every product feature, customer account, and department. GitHub deployments and Jira tickets automatically post updates to relevant channels. Our team response time improved dramatically.',
        feedbackCons:    'Managing notification settings takes time. New team members get overwhelmed by active channels initially.',
      },
    ],
  },

  // ── 6. HubSpot CRM ────────────────────────────────────────────────────────
  {
    name:           'HubSpot CRM',
    slug:           'hubspot-crm',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/3/35/HubSpot_Logo.svg',
    screenshots:    [],
    tagline:        'Free CRM with powerful sales, marketing & service hubs',
    description:    '<p>HubSpot CRM is the world\'s most popular free CRM platform, used by over 205,000 companies across 135 countries. It provides a complete view of your sales pipeline, contact management, deal tracking, email sequences, live chat, landing pages, and marketing automation — all in one tightly integrated platform. HubSpot\'s generous free tier makes it perfect for startups and growing businesses, with paid Hubs available as your needs scale.</p>',
    categorySlug:   'crm-software',
    pricingType:    'Freemium',
    startingPrice:  1800,
    billingCycle:   'Monthly',
    affiliateLink:  'https://hubspot.com',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  '🆓 Best Free CRM',
    upvotes:        3940,
    averageRating:  4.5,
    totalReviews:   41600,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  1000,
    cashbackLabel:  'Get ₹1000 cashback on HubSpot paid plans via SaaTerra',
    cashbackValidity: 'Valid on Starter or Professional plans',
    metaTitle:      'HubSpot CRM Review & Cashback | SaaTerra — Best Free CRM 2025',
    metaDescription: 'Get HubSpot CRM via SaaTerra and earn ₹1000 cashback. Best free CRM for sales, marketing, and customer service.',
    metaKeywords:   'hubspot crm review, hubspot cashback, free crm india, hubspot india',
    pros: [
      'Genuinely powerful free plan — contact management, deals, email, and chat',
      'Seamless integration across Sales, Marketing, and Service hubs',
      'Intuitive drag-and-drop pipeline view for visual deal management',
      'Extensive integration ecosystem — 1,000+ native app connections',
    ],
    cons: [
      'Paid plans become expensive quickly as you unlock advanced features',
      'Marketing Hub automation requires Professional tier at significant cost',
    ],
    reviews: [
      {
        userName:        'Sandeep Verma',
        userDesignation: 'Sales Director, B2B SaaS (Gurugram)',
        rating: 5,
        reviewTitle:     'Best-in-class CRM — free plan alone beat our old paid CRM',
        feedbackPros:    'We moved from a ₹8,000/month CRM to HubSpot Free and got more features. Deal stages, email tracking, sequences, meeting scheduling links — all free. The paid Sales Hub added forecasting which our leadership team loves.',
        feedbackCons:    'Reporting on the free plan is very basic. Need to upgrade for custom dashboards.',
      },
    ],
  },

  // ── 7. Razorpay ───────────────────────────────────────────────────────────
  {
    name:           'Razorpay',
    slug:           'razorpay',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
    screenshots:    [],
    tagline:        "India's leading payment gateway for businesses of all sizes",
    description:    '<p>Razorpay is India\'s most trusted full-stack financial platform, enabling businesses to accept, process, and disburse payments with ease. Supporting 100+ payment methods including UPI, cards, net banking, wallets, EMIs, and BNPL — Razorpay powers over 8 million businesses across India. It also offers a complete payment suite with subscriptions, payment links, invoices, payouts, payroll, and current account features.</p>',
    categorySlug:   'payment-tools',
    pricingType:    'Freemium',
    startingPrice:  0,
    billingCycle:   'Monthly',
    affiliateLink:  'https://razorpay.com',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  "🇮🇳 India's #1 Gateway",
    upvotes:        4100,
    averageRating:  4.7,
    totalReviews:   29800,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  600,
    cashbackLabel:  'Get ₹600 cashback on Razorpay premium plans via SaaTerra',
    cashbackValidity: 'Valid on annual plans',
    metaTitle:      'Razorpay Review & Cashback | SaaTerra — Best Payment Gateway India',
    metaDescription: 'Get Razorpay via SaaTerra and earn ₹600 cashback. Best payment gateway supporting UPI, cards, and 100+ payment methods.',
    metaKeywords:   'razorpay review, razorpay cashback, razorpay india, best payment gateway india',
    pros: [
      '100+ payment methods — UPI, RuPay, Visa, EMI, BNPL, and international cards',
      'Instant activation — start accepting payments within 24 hours',
      'Smart checkout boosts conversion with one-click saved card experience',
      'Subscription billing, payment links, and invoicing built-in',
    ],
    cons: [
      '2% transaction fee on international cards can add up for high-volume businesses',
      'Customer support response time can be slow during high traffic periods',
    ],
    reviews: [
      {
        userName:        'Kunal Joshi',
        userDesignation: 'Founder, D2C Skincare Brand (Mumbai)',
        rating: 5,
        reviewTitle:     'Best payment experience for Indian customers — UPI is seamless',
        feedbackPros:    'Our D2C store integrated Razorpay in one day. UPI conversion rates are amazing — 82% of our customers pay via UPI. The dashboard shows real-time settlements and payment analytics.',
        feedbackCons:    'Chargeback disputes can take 15-20 days to resolve. Would love a faster resolution process.',
      },
    ],
  },

  // ── 8. Shopify ────────────────────────────────────────────────────────────
  {
    name:           'Shopify',
    slug:           'shopify',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
    screenshots:    [],
    tagline:        'The complete e-commerce platform to build your online store',
    description:    '<p>Shopify is the world\'s leading e-commerce platform, powering over 1.7 million businesses across 175 countries. It provides everything needed to launch and scale an online store — customizable storefronts, secure payment processing, inventory management, shipping integrations, marketing tools, analytics, and a 6,000+ app ecosystem. From first-time entrepreneurs to global brands like Heinz and Allbirds, Shopify scales with every stage of business growth.</p>',
    categorySlug:   'e-commerce',
    pricingType:    'Paid',
    startingPrice:  1740,
    billingCycle:   'Monthly',
    affiliateLink:  'https://shopify.com',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  '🛒 E-Commerce Leader',
    upvotes:        4920,
    averageRating:  4.7,
    totalReviews:   52800,
    couponActive:   true,
    couponCode:     'SAATERRA3M',
    couponDiscount: '3 Months Free',
    couponLabel:    'SPECIAL OFFER',
    couponExpiry:   '2025-10-31',
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  900,
    cashbackLabel:  'Buy Shopify Basic via SaaTerra & get ₹900 cashback',
    cashbackValidity: 'Valid on annual Basic or Shopify plans',
    metaTitle:      'Shopify Review & Cashback | SaaTerra — Best E-Commerce Platform India',
    metaDescription: 'Get Shopify via SaaTerra and earn ₹900 cashback + 3 months free. Best e-commerce platform for Indian D2C brands.',
    metaKeywords:   'shopify review, shopify cashback, shopify india, start online store india, d2c platform',
    pros: [
      'Complete e-commerce suite — store, payments, shipping, inventory, and analytics',
      '6,000+ apps in the Shopify App Store for any customization need',
      'Shopify Payments eliminates third-party payment gateway fees',
      'Multi-channel selling — Instagram, Facebook, Google, and Amazon integration',
    ],
    cons: [
      'Transaction fees apply when using non-Shopify payment gateways',
      'Advanced theme customization requires Liquid templating knowledge',
    ],
    reviews: [
      {
        userName:        'Trisha Bhatt',
        userDesignation: 'Founder, Handmade Jewellery Brand (Surat)',
        rating: 5,
        reviewTitle:     'Went from 0 to ₹3 lakh/month revenue in 6 months with Shopify',
        feedbackPros:    'Shopify made it incredibly easy to launch my jewellery store. The checkout conversion is amazing. Instagram Shopping integration doubled my sales. Very beginner-friendly.',
        feedbackCons:    'Shopify fees on international orders can add up. Would love native UPI gateway support without third-party plugins.',
      },
    ],
  },

  // ── 9. Ahrefs ─────────────────────────────────────────────────────────────
  {
    name:           'Ahrefs',
    slug:           'ahrefs',
    logo:           'https://ahrefs.com/assets/images/ahrefs-icon-blue.svg',
    screenshots:    [],
    tagline:        "World-class SEO tools for backlink analysis & keyword research",
    description:    "<p>Ahrefs is one of the world's most powerful and data-rich SEO tool suites, used by over 900,000 marketing professionals, SEO agencies, and in-house teams. It features a 35.5 trillion link database (the largest in the industry), keyword explorer with 29 billion keywords across 10 search engines, Site Audit, Content Explorer, Rank Tracker, and competitive analysis tools. Ahrefs is the gold standard for backlink analysis and competitor research.</p>",
    categorySlug:   'seo-tools',
    pricingType:    'Paid',
    startingPrice:  8300,
    billingCycle:   'Monthly',
    affiliateLink:  'https://ahrefs.com',
    isFeatured:     false,
    isTopRated:     true,
    featuredBadge:  '🔗 Best Backlink Tool',
    upvotes:        2760,
    averageRating:  4.7,
    totalReviews:   11400,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  1200,
    cashbackLabel:  'Buy Ahrefs via SaaTerra & get ₹1200 cashback',
    cashbackValidity: 'Valid on Lite or Standard annual plan',
    metaTitle:      'Ahrefs Review & Cashback | SaaTerra — Best SEO Backlink Tool 2025',
    metaDescription: 'Get Ahrefs via SaaTerra and earn ₹1200 cashback. Best backlink analysis, keyword research, and SEO audit tool.',
    metaKeywords:   'ahrefs review, ahrefs cashback, ahrefs india, best seo tool, backlink checker',
    pros: [
      'Largest backlink index — 35.5 trillion links updated every 15 minutes',
      'Keyword Explorer covers 10 search engines including YouTube and Amazon',
      'Content Explorer finds top-ranking content ideas in any niche instantly',
      'Site Audit detects 130+ technical SEO issues with clear fix priorities',
    ],
    cons: [
      'No free trial available — requires paid subscription immediately',
      'Higher pricing compared to competitors for equivalent data access',
    ],
    reviews: [
      {
        userName:        'Varun Khanna',
        userDesignation: 'Founder, SEO Agency (Chandigarh)',
        rating: 5,
        reviewTitle:     'The best backlink database in the world — period',
        feedbackPros:    "Ahrefs' backlink data is always fresh — I can see new backlinks within 24 hours of them going live. The Content Gap tool shows exactly which keywords competitors rank for that our clients don't. Drives our entire content strategy.",
        feedbackCons:    'API access is expensive and only available on Enterprise plans.',
      },
    ],
  },

  // ── 10. Grammarly ─────────────────────────────────────────────────────────
  {
    name:           'Grammarly',
    slug:           'grammarly',
    logo:           'https://upload.wikimedia.org/wikipedia/en/f/f1/Grammarly-logo.svg',
    screenshots:    [],
    tagline:        'AI writing assistant for clear, mistake-free professional communication',
    description:    "<p>Grammarly is the world's leading AI-powered writing assistant, used by over 30 million people daily across 500,000 teams and organisations. It checks grammar, spelling, punctuation, clarity, tone, and style in real-time across every platform — Gmail, Docs, Slack, LinkedIn, and 500,000+ apps via its browser extension. Grammarly Business adds team-level style guides, brand consistency, and analytics, making it essential for professional communication at scale.</p>",
    categorySlug:   'productivity',
    pricingType:    'Freemium',
    startingPrice:  1600,
    billingCycle:   'Monthly',
    affiliateLink:  'https://grammarly.com',
    isFeatured:     false,
    isTopRated:     true,
    featuredBadge:  "✍️ Writers' Favourite",
    upvotes:        3100,
    averageRating:  4.6,
    totalReviews:   19200,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  400,
    cashbackLabel:  'Buy Grammarly Premium via SaaTerra & get ₹400 cashback',
    cashbackValidity: 'Valid on annual Premium plan',
    metaTitle:      'Grammarly Review & Cashback | SaaTerra — Best AI Writing Assistant',
    metaDescription: 'Get Grammarly via SaaTerra and earn ₹400 cashback. Best AI grammar checker and writing assistant used by 30M+ professionals.',
    metaKeywords:   'grammarly review, grammarly cashback, grammarly india, ai writing tool, grammar checker',
    pros: [
      'Works everywhere — Gmail, Docs, LinkedIn, Slack via seamless browser extension',
      'Tone detection ensures emails and messages land the right way',
      'GrammarlyGO AI generates full paragraphs and rewrites instantly',
      'Plagiarism checker compares against 16 billion web pages (Premium)',
    ],
    cons: [
      'Occasional over-correction of intentional stylistic choices',
      'Premium plan pricing is significant for students and budget-conscious users',
    ],
    reviews: [
      {
        userName:        'Nandini Rao',
        userDesignation: 'Content Writer & Blogger (Pune)',
        rating: 5,
        reviewTitle:     'My writing became 3x more professional after Grammarly',
        feedbackPros:    'I write 5-6 articles per week and Grammarly catches clarity issues I would never notice myself. The tone detector helped me make my client emails much more professional.',
        feedbackCons:    'Occasionally flags perfectly correct sentences as errors. Always double-check suggestions.',
      },
    ],
  },

  // ── 11. Loom ──────────────────────────────────────────────────────────────
  {
    name:           'Loom',
    slug:           'loom',
    logo:           'https://cdn.sanity.io/images/7c5vvbxk/production/5fece49c8e6e9ba6cfaa73f1889cbbcb3d25d0a2-800x800.png',
    screenshots:    [],
    tagline:        'Record, share & react to async video messages in seconds',
    description:    '<p>Loom is the leading asynchronous video messaging tool that lets you record your screen, camera, or both, and instantly share it via a shareable link — no file downloads needed. Used by over 21 million users across 200,000+ companies, Loom is perfect for async standups, product demos, bug reports, code reviews, onboarding, and customer communication. Loom AI automatically generates transcripts, summaries, and action items from your videos.</p>',
    categorySlug:   'productivity',
    pricingType:    'Freemium',
    startingPrice:  1250,
    billingCycle:   'Monthly',
    affiliateLink:  'https://loom.com',
    isFeatured:     false,
    isTopRated:     false,
    featuredBadge:  "🔥 Editor's Choice",
    upvotes:        1840,
    averageRating:  4.7,
    totalReviews:   8900,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  350,
    cashbackLabel:  'Buy Loom Business via SaaTerra & get ₹350 cashback',
    cashbackValidity: 'Valid on Business annual plan',
    metaTitle:      'Loom Review & Cashback | SaaTerra — Async Video Tool for Remote Teams',
    metaDescription: 'Get Loom via SaaTerra and earn ₹350 cashback. Best async screen recording tool. Auto-transcripts and video summaries with AI.',
    metaKeywords:   'loom review, loom cashback, loom video tool, async video, screen recorder',
    pros: [
      'Instant shareable link — no downloading or uploading needed',
      'Loom AI generates transcripts, summaries, and action items automatically',
      'Viewer reactions and comments make async communication feel interactive',
      'Replaces long meetings with clear, concise video walkthroughs',
    ],
    cons: [
      'Free plan limits recordings to 5 minutes — too short for detailed demos',
      'Storage limits can be reached quickly on the free plan',
    ],
    reviews: [
      {
        userName:        'Aditya Raina',
        userDesignation: 'Remote Product Designer (Goa)',
        rating: 5,
        reviewTitle:     'Loom saved us from 80% of unnecessary Zoom meetings',
        feedbackPros:    'Instead of calling a 30-minute meeting to explain a design decision, I record a 5-minute Loom. The AI-generated summary lets teammates skim key decisions. Game-changer for our fully remote team.',
        feedbackCons:    'Video quality drops slightly on slower connections during recording.',
      },
    ],
  },

  // ── 12. Freshdesk ─────────────────────────────────────────────────────────
  {
    name:           'Freshdesk',
    slug:           'freshdesk',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/a/a2/Freshdesk_logo.svg',
    screenshots:    [],
    tagline:        'Delightful customer support software for growing businesses',
    description:    '<p>Freshdesk is an award-winning cloud-based customer support platform by Freshworks that helps over 60,000+ businesses deliver exceptional customer service. It unifies customer queries from email, phone, chat, social media, and web portals into one smart inbox. With powerful automation, AI-powered Freddy bot, SLA management, and a 360-degree customer view, Freshdesk helps support teams resolve issues faster and delight customers at every touchpoint.</p>',
    categorySlug:   'customer-support',
    pricingType:    'Freemium',
    startingPrice:  1399,
    billingCycle:   'Monthly',
    affiliateLink:  'https://freshdesk.com',
    isFeatured:     false,
    isTopRated:     true,
    featuredBadge:  '🏆 Top Rated',
    upvotes:        2200,
    averageRating:  4.5,
    totalReviews:   13200,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  600,
    cashbackLabel:  'Buy Freshdesk via SaaTerra & get ₹600 cashback',
    cashbackValidity: 'Valid on Growth or Pro annual plan',
    metaTitle:      'Freshdesk Review & Cashback | SaaTerra — Best Helpdesk Software 2025',
    metaDescription: 'Get Freshdesk via SaaTerra and earn ₹600 cashback. Best customer support helpdesk with AI, automation, and omnichannel ticketing.',
    metaKeywords:   'freshdesk review, freshdesk cashback, freshdesk india, helpdesk software',
    pros: [
      'Omnichannel support — email, chat, phone, Twitter, WhatsApp in one inbox',
      'Freddy AI automatically suggests solutions and handles routine queries',
      'Free plan supports unlimited agents — best in class free tier',
      'SLA policies with automatic escalation ensure no ticket is missed',
    ],
    cons: [
      'Advanced automation rules available only on higher-tier plans',
      'Custom reporting requires the Enterprise plan which is expensive',
    ],
    reviews: [
      {
        userName:        'Meera Pillai',
        userDesignation: 'Customer Success Lead, EdTech (Chennai)',
        rating: 4,
        reviewTitle:     'Handles 2000+ tickets/month without breaking a sweat',
        feedbackPros:    'We moved from basic email support to Freshdesk and our first response time dropped from 8 hours to 45 minutes. Automated ticket routing sends queries to the right team instantly.',
        feedbackCons:    'Mobile app is not as feature-complete as the web interface.',
      },
    ],
  },

  // ── 13. Mailchimp ─────────────────────────────────────────────────────────
  {
    name:           'Mailchimp',
    slug:           'mailchimp',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/9/9b/Mailchimp-Logo.png',
    screenshots:    [],
    tagline:        'Powerful email marketing & automation for growing businesses',
    description:    "<p>Mailchimp is the world's largest email marketing platform, trusted by over 13 million businesses to send 500 million emails daily. Beyond email campaigns, Mailchimp offers a full marketing suite including audience segmentation, marketing automation, landing pages, website builder, social media ads, and CRM features. Its intuitive drag-and-drop email builder and extensive template library make it the go-to choice for businesses starting their email marketing journey.</p>",
    categorySlug:   'email-marketing',
    pricingType:    'Freemium',
    startingPrice:  700,
    billingCycle:   'Monthly',
    affiliateLink:  'https://mailchimp.com',
    isFeatured:     false,
    isTopRated:     false,
    featuredBadge:  '📧 Most Trusted',
    upvotes:        2180,
    averageRating:  4.4,
    totalReviews:   28100,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  400,
    cashbackLabel:  'Buy Mailchimp Essentials via SaaTerra & earn ₹400 cashback',
    cashbackValidity: 'Valid on Essentials or Standard plans',
    metaTitle:      'Mailchimp Review & Cashback | SaaTerra — Best Email Marketing Tool',
    metaDescription: 'Get Mailchimp via SaaTerra and earn ₹400 cashback. Best email marketing platform with automation, segmentation, and landing pages.',
    metaKeywords:   'mailchimp review, mailchimp cashback, email marketing india, mailchimp india deal',
    pros: [
      'Drag-and-drop email builder is extremely beginner-friendly',
      'Free plan supports up to 500 contacts and 1,000 emails/month',
      'Pre-built automation journeys for welcome, abandoned cart, and re-engagement',
      'Advanced A/B testing optimises subject lines and send times',
    ],
    cons: [
      'Free plan adds Mailchimp branding to all emails — looks unprofessional',
      'Pricing scales steeply as subscriber count grows beyond 10,000',
    ],
    reviews: [
      {
        userName:        'Lakshmi Sundaram',
        userDesignation: 'Founder, Online Boutique (Coimbatore)',
        rating: 4,
        reviewTitle:     'My first email marketing tool — very easy for beginners',
        feedbackPros:    'I started with 0 email marketing experience and had my first campaign running in an hour. The drag-and-drop builder is very intuitive. Abandoned cart automation brought back 12% of potential customers.',
        feedbackCons:    'Once my list grew past 5,000 subscribers, pricing jumped significantly.',
      },
    ],
  },

  // ── 14. Webflow ───────────────────────────────────────────────────────────
  {
    name:           'Webflow',
    slug:           'webflow',
    logo:           'https://upload.wikimedia.org/wikipedia/en/9/9c/Webflow_logo.svg',
    screenshots:    [],
    tagline:        'Build production-ready websites visually without writing code',
    description:    "<p>Webflow is a visual web design platform that lets designers build fully responsive, production-ready websites without writing a single line of code — yet it generates clean, professional HTML, CSS, and JavaScript output. With its CMS, powerful animation tools, hosting infrastructure, and e-commerce capabilities, Webflow has become the professional standard for marketing websites, landing pages, and portfolios. Over 3.5 million designers and agencies trust Webflow.</p>",
    categorySlug:   'website-builder',
    pricingType:    'Freemium',
    startingPrice:  1700,
    billingCycle:   'Monthly',
    affiliateLink:  'https://webflow.com',
    isFeatured:     false,
    isTopRated:     true,
    featuredBadge:  '⚡ No-Code Leader',
    upvotes:        2010,
    averageRating:  4.6,
    totalReviews:   9800,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  700,
    cashbackLabel:  'Buy Webflow Basic via SaaTerra & get ₹700 cashback',
    cashbackValidity: 'Valid on annual plans',
    metaTitle:      'Webflow Review & Cashback | SaaTerra — Best No-Code Website Builder',
    metaDescription: 'Get Webflow via SaaTerra and earn ₹700 cashback. Best visual website builder for designers. No-code, professional-grade, and highly customizable.',
    metaKeywords:   'webflow review, webflow cashback, no code website builder, webflow india',
    pros: [
      'Visual design with full CSS control — pixel-perfect results without coding',
      'Built-in CMS for blogs, portfolios, and dynamic content',
      'Interactions and animations editor creates complex scroll animations visually',
      'Clean semantic code output — great for SEO and performance',
    ],
    cons: [
      'Very steep learning curve — not suitable for true beginners',
      'E-commerce features are limited compared to dedicated platforms like Shopify',
    ],
    reviews: [
      {
        userName:        'Karan Sharma',
        userDesignation: 'Freelance Web Designer (Jaipur)',
        rating: 5,
        reviewTitle:     'Finally a tool that gives me full creative control without code',
        feedbackPros:    'I can build sites that would have required a developer previously. My client turnaround time dropped from 3 weeks to 5 days. Webflow CMS is incredibly powerful for content-heavy client sites.',
        feedbackCons:    'The learning curve is real — I spent 3 weekends on Webflow University before I felt confident.',
      },
    ],
  },

  // ── 15. Jasper AI ─────────────────────────────────────────────────────────
  {
    name:           'Jasper AI',
    slug:           'jasper-ai',
    logo:           'https://assets.jasper.ai/public/logos/jasper-logo-dark.svg',
    screenshots:    [],
    tagline:        'Enterprise AI content platform for high-performing marketing teams',
    description:    '<p>Jasper AI is the leading enterprise-grade AI writing and content marketing platform trusted by over 100,000+ marketing teams at brands like Airbus, HubSpot, and Keller Williams. It generates SEO-optimised blog posts, social media ads, product descriptions, email campaigns, and brand-voice content — all trained to match your specific brand guidelines. Jasper integrates with Surfer SEO, Grammarly, and Google Docs for a seamless content workflow.</p>',
    categorySlug:   'ai-tools',
    pricingType:    'Paid',
    startingPrice:  4500,
    billingCycle:   'Monthly',
    affiliateLink:  'https://jasper.ai',
    isFeatured:     true,
    isTopRated:     false,
    featuredBadge:  '🤖 AI Content Leader',
    upvotes:        2890,
    averageRating:  4.5,
    totalReviews:   12800,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  1000,
    cashbackLabel:  'Buy Jasper AI Creator via SaaTerra & get ₹1000 cashback',
    cashbackValidity: 'Valid on annual Creator or Teams plans',
    metaTitle:      'Jasper AI Review & Cashback | SaaTerra — Best AI Writing Tool 2025',
    metaDescription: 'Get Jasper AI via SaaTerra and earn ₹1000 cashback. Best enterprise AI content writing platform for marketing teams.',
    metaKeywords:   'jasper ai review, jasper ai cashback, ai writing tool, jasper ai india',
    pros: [
      'Brand Voice feature trains AI to write in your unique tone and style',
      'Pre-built marketing templates for 50+ content types',
      'Surfer SEO integration optimises AI content for search ranking simultaneously',
      '30+ language support for global content marketing',
    ],
    cons: [
      'Expensive compared to general-purpose AI tools like ChatGPT or Claude',
      'AI output still requires human editing for factual accuracy and nuance',
    ],
    reviews: [
      {
        userName:        'Divya Menon',
        userDesignation: 'Content Marketing Lead, B2B SaaS (Bengaluru)',
        rating: 5,
        reviewTitle:     'Our content output tripled without hiring more writers',
        feedbackPros:    'Jasper drafts our blog post outlines and first drafts using our brand voice profile. We go from brief to published in 2 days instead of 7. The SEO Blog Post template with Surfer integration ranks content faster.',
        feedbackCons:    'Factual accuracy still needs human review — Jasper can confidently state incorrect statistics.',
      },
    ],
  },

  // ── 16. Zoho One ──────────────────────────────────────────────────────────
  {
    name:           'Zoho One',
    slug:           'zoho-one',
    logo:           'https://upload.wikimedia.org/wikipedia/commons/6/6d/Zoho_Logo.svg',
    screenshots:    [],
    tagline:        'The complete operating system for your business — 45+ apps',
    description:    '<p>Zoho One is the most comprehensive business operating system available, giving you access to over 45 integrated Zoho applications — from CRM, email, and project management to accounting, HR, marketing, and analytics — under a single subscription. Purpose-built for Indian SMEs and global enterprises, Zoho One delivers enterprise-grade functionality at a fraction of the cost of buying individual tools.</p>',
    categorySlug:   'crm-software',
    pricingType:    'Paid',
    startingPrice:  1800,
    billingCycle:   'Monthly',
    affiliateLink:  'https://zoho.com/one',
    isFeatured:     false,
    isTopRated:     false,
    featuredBadge:  '🇮🇳 Made in India',
    upvotes:        2910,
    averageRating:  4.5,
    totalReviews:   22400,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  800,
    cashbackLabel:  'Buy Zoho One via SaaTerra & get ₹800 cashback',
    cashbackValidity: 'Valid on annual subscription',
    metaTitle:      'Zoho One Review & Cashback | SaaTerra — Best Business Suite India',
    metaDescription: 'Get Zoho One via SaaTerra and earn ₹800 cashback. 45+ business apps for CRM, HR, accounting, and marketing in one subscription.',
    metaKeywords:   'zoho one review, zoho cashback, zoho india, zoho crm, zoho one deal',
    pros: [
      '45+ integrated business apps — CRM, books, HR, marketing, and more',
      'Best value for SMEs — replaces 10+ separate subscriptions',
      'Indian data residency option — data stored in India for compliance',
      'Strong GST, TDS, and Indian payroll compliance built-in',
    ],
    cons: [
      'Too many apps can be overwhelming for small teams who need simplicity',
      'Some apps like Zoho Social lag behind specialized competitors',
    ],
    reviews: [
      {
        userName:        'Kavita Reddy',
        userDesignation: 'CEO, Manufacturing SME (Hyderabad)',
        rating: 4,
        reviewTitle:     'Replaced 8 software subscriptions with just Zoho One',
        feedbackPros:    'We were paying separately for CRM, accounting, HR, email, and project management. Zoho One replaced all of them. Indian GST and payroll compliance works out of the box.',
        feedbackCons:    'Initial migration of data from our old CRM was tedious. Required a dedicated 3-day onboarding session.',
      },
    ],
  },

  // ── 17. Vyapaar App ───────────────────────────────────────────────────────
  {
    name:          'Vyapaar App',
    slug:          'vyapaar-app',
    logo:          'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_39316d3f237bf3bb66c2bb20d6f2bb60/vyapar.png',
    screenshots:   [],
    tagline:       'Simplifying GST Billing & Inventory Management for Indian SMEs',
    description:   "<p>Vyapaar App is India's fastest-growing GST billing and inventory management software built specifically for small and medium businesses, kirana stores, wholesalers, and retailers. It handles GST invoicing, stock management, UPI payments, and WhatsApp-based customer communication — all in one platform that works even offline. With over 1 crore downloads, Vyapaar is the most trusted billing app for Indian SMEs.</p>",
    categorySlug:  'billing-software',
    pricingType:   'Paid',
    startingPrice: 2499,
    billingCycle:  'Yearly',
    affiliateLink: 'https://vyaparapp.in',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  "🇮🇳 India's Best GST App",
    upvotes:        3800,
    averageRating:  4.5,
    totalReviews:   41200,
    couponActive:   true,
    couponCode:     'TERRA10',
    couponDiscount: '10% OFF',
    couponLabel:    'LIMITED OFFER',
    couponExpiry:   '2025-09-30',
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  300,
    cashbackLabel:  'Buy Vyapaar via SaaTerra & get ₹300 cashback',
    cashbackValidity: 'Valid on Silver or Gold annual plans',
    metaTitle:      'Vyapaar App Review & Cashback | SaaTerra — Best GST Billing India',
    metaDescription: 'Get Vyapaar App via SaaTerra and earn ₹300 cashback + extra 10% discount. Best GST billing and inventory management software.',
    metaKeywords:   'vyapaar app review, vyapaar cashback, gst billing software india, vyapaar discount',
    pros: [
      'Works completely offline — GST invoices even without internet connectivity',
      'UPI QR code on every invoice — customers pay instantly with any UPI app',
      'Direct WhatsApp invoice sharing — send bills in 1 tap to customers',
      'Real-time stock tracking with automatic low-stock alerts',
    ],
    cons: [
      'iOS app has fewer features compared to the more mature Android version',
      'Desktop app UI feels slightly dated compared to the mobile app',
    ],
    reviews: [
      {
        userName:        'Rajesh Agarwal',
        userDesignation: 'Retail Store Owner (Jaipur)',
        rating: 5,
        reviewTitle:     'Best billing software for small retail stores in India',
        feedbackPros:    'Vyapaar makes GST invoice creation super fast. Even without active internet in our shop, offline mode saves invoices seamlessly and syncs automatically later. UPI QR printing on bills is very convenient.',
        feedbackCons:    'The desktop app takes a few seconds to load when generating multi-page inventory reports.',
      },
      {
        userName:        'Suresh Kumar',
        userDesignation: 'Wholesale Distributor (Delhi)',
        rating: 4,
        reviewTitle:     'Extremely easy inventory and stock tracking',
        feedbackPros:    'I can send invoices directly on WhatsApp to my clients with a single tap. Stock alerts help me reorder inventory before running out.',
        feedbackCons:    'Would love to see multi-currency support for export clients.',
      },
    ],
  },

  // ── 18. TeleCRM ───────────────────────────────────────────────────────────
  {
    name:          'TeleCRM',
    slug:          'telecrm',
    logo:          'https://telecrm.in/static/media/telecrm-logo.4ed7ee3d.svg',
    screenshots:   [],
    tagline:       'WhatsApp-first sales CRM built for Indian sales teams',
    description:   '<p>TeleCRM is a WhatsApp-first sales CRM designed for Indian sales teams and growth-focused startups. It integrates with the official WhatsApp Business API to automate lead nurturing, distribute inbound leads across your team, and provide real-time call and chat analytics — all from a single dashboard. Trusted by 2,000+ Indian businesses from real estate, edtech, and insurance sectors.</p>',
    categorySlug:  'crm-software',
    pricingType:   'Paid',
    startingPrice: 899,
    billingCycle:  'Monthly',
    affiliateLink: 'https://telecrm.in',
    isFeatured:     false,
    isTopRated:     true,
    featuredBadge:  '🇮🇳 Made in India',
    upvotes:        1940,
    averageRating:  4.6,
    totalReviews:   3840,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  350,
    cashbackLabel:  'Buy TeleCRM via SaaTerra & get ₹350 cashback',
    cashbackValidity: 'Valid on annual plans',
    metaTitle:      'TeleCRM Review & Cashback | SaaTerra — Best WhatsApp CRM India',
    metaDescription: 'Get TeleCRM via SaaTerra and earn ₹350 cashback. Best WhatsApp Business API CRM for Indian sales teams.',
    metaKeywords:   'telecrm review, telecrm cashback, whatsapp crm india, sales crm india',
    pros: [
      'Official WhatsApp Business API — broadcast and automate at scale legally',
      'Auto lead distribution across field agents and telecallers',
      'Real-time call recording and team analytics dashboard',
      'Best for Indian sales contexts — real estate, insurance, and education',
    ],
    cons: [
      'Initial WhatsApp Business API setup and Facebook verification takes 24-48 hours',
      'Bulk CSV export can be slow for datasets over 50,000 leads',
    ],
    reviews: [
      {
        userName:        'Vikram Mehta',
        userDesignation: 'Head of Sales, EduTech (Lucknow)',
        rating: 5,
        reviewTitle:     'Transformed our WhatsApp sales conversion rate by 3x!',
        feedbackPros:    'Official WhatsApp Business API allows our team to auto-assign incoming leads to telecallers and track call durations effortlessly. Response time dropped from hours to minutes.',
        feedbackCons:    'Initial setup of WhatsApp API templates took about 24 hours for Facebook verification.',
      },
      {
        userName:        'Neha Sharma',
        userDesignation: 'Real Estate Sales Lead (Mumbai)',
        rating: 5,
        reviewTitle:     'Great mobile CRM for field agents',
        feedbackPros:    'Automatic call recording and lead distribution makes telecalling tracking completely transparent.',
        feedbackCons:    'Bulk export to CSV can be slightly slow for datasets over 50,000 leads.',
      },
    ],
  },

  // ── 19. Hostinger India ───────────────────────────────────────────────────
  {
    name:          'Hostinger India',
    slug:          'hostinger-india',
    logo:          'https://upload.wikimedia.org/wikipedia/commons/0/07/Hostinger_logo.svg',
    screenshots:   [],
    tagline:       'Ultra-Fast WordPress Hosting with Free Domain & Daily Backups',
    description:   "<p>Hostinger India is one of the most popular budget-to-mid-range web hosting platforms used by Indian developers, bloggers, and small business owners. It offers NVMe SSD hosting, LiteSpeed servers, and a custom-built hPanel control panel that makes site management simple — with a 99.9% uptime guarantee and localised Hindi support.</p>",
    categorySlug:  'web-hosting',
    pricingType:   'Paid',
    startingPrice: 149,
    billingCycle:  'Monthly',
    affiliateLink: 'https://hostinger.in',
    isFeatured:     false,
    isTopRated:     true,
    featuredBadge:  '⚡ Fastest Budget Hosting',
    upvotes:        3200,
    averageRating:  4.7,
    totalReviews:   18900,
    couponActive:   true,
    couponCode:     'SAATERRA',
    couponDiscount: 'Extra 7% OFF',
    couponLabel:    'EXCLUSIVE DISCOUNT',
    couponExpiry:   '2025-12-31',
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  250,
    cashbackLabel:  'Buy Hostinger via SaaTerra & get ₹250 cashback',
    cashbackValidity: 'Valid on annual plans',
    metaTitle:      'Hostinger India Review & Cashback | SaaTerra — Best Cheap Hosting India',
    metaDescription: 'Get Hostinger India via SaaTerra and earn ₹250 cashback + extra discount. Fastest budget WordPress hosting with free SSL and domain.',
    metaKeywords:   'hostinger india review, hostinger cashback, cheap web hosting india, hostinger discount',
    pros: [
      '0.5s average loading — powered by LiteSpeed + NVMe SSD storage',
      '24/7 localised support chat available in English and Hindi',
      'Free SSL certificates, daily backups, and domain included on annual plans',
    ],
    cons: [
      'Renewal pricing scales significantly higher after the introductory period',
      'No phone support available — support is exclusively live chat',
    ],
    reviews: [
      {
        userName:        'Amitav Roy',
        userDesignation: 'Full Stack Web Developer (Kolkata)',
        rating: 5,
        reviewTitle:     'Unbeatable performance and uptime for the price',
        feedbackPros:    'LiteSpeed server caching combined with NVMe storage gives sub-second page loads for our WordPress client sites. The custom hPanel interface is much cleaner than traditional cPanel.',
        feedbackCons:    'No phone support available — support is exclusively live chat.',
      },
      {
        userName:        'Pooja Verma',
        userDesignation: 'Digital Marketing Consultant',
        rating: 4,
        reviewTitle:     'Super fast live chat support and free SSL',
        feedbackPros:    'One-click WordPress installation and free SSL installation took less than 3 minutes to go live.',
        feedbackCons:    'Introductory 4-year deal is great, but 1-year renewal prices jump up.',
      },
    ],
  },

  // ── 20. Keka HR ───────────────────────────────────────────────────────────
  {
    name:          'Keka HR',
    slug:          'keka-hr',
    logo:          'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_7cb360b94326550756e18987b7a602cf/keka-hr.png',
    screenshots:   [],
    tagline:       'Employee Attendance & Automated Payroll Portal for India',
    description:   '<p>Keka HR is a modern, India-first HR and payroll management platform used by 7,000+ businesses across sectors. It handles employee attendance (including biometric device integration), automatic payroll processing, PF/ESI/TDS compliance, leave management, and offers an employee self-service portal — making it the go-to HRMS for growing Indian companies.</p>',
    categorySlug:  'hr-payroll-software',
    pricingType:   'Paid',
    startingPrice: 4999,
    billingCycle:  'Yearly',
    affiliateLink: 'https://keka.com',
    isFeatured:     true,
    isTopRated:     true,
    featuredBadge:  '🇮🇳 HR Leader India',
    upvotes:        2480,
    averageRating:  4.6,
    totalReviews:   5930,
    couponActive:   false,
    cashbackActive: true,
    cashbackType:   'flat',
    cashbackValue:  700,
    cashbackLabel:  'Buy Keka HR via SaaTerra & get ₹700 cashback',
    cashbackValidity: 'Valid on Foundation or Strength plans',
    metaTitle:      'Keka HR Review & Cashback | SaaTerra — Best HRMS Payroll India',
    metaDescription: 'Get Keka HR via SaaTerra and earn ₹700 cashback. Best HR and payroll software for Indian companies with PF, ESI, TDS compliance.',
    metaKeywords:   'keka hr review, keka hr cashback, payroll software india, hrms india',
    pros: [
      'Biometric auto sync routing — integrates directly with punch machines',
      'Statutory tax compliances sorted — PF, ESI, PT, and TDS handled automatically',
      'Employee self-service grid — staff can apply for leave, view payslips independently',
    ],
    cons: [
      'Too feature-heavy and bulky for micro startups with under 5 employees',
    ],
    reviews: [
      {
        userName:        'Ananya Deshmukh',
        userDesignation: 'HR Manager, TechCorp (Pune)',
        rating: 5,
        reviewTitle:     'Payroll processing time reduced from 4 days to 30 minutes!',
        feedbackPros:    'Biometric integration syncs attendance automatically. PF, ESI, and Form 16 calculations are completely automated without manual spreadsheet errors.',
        feedbackCons:    'Custom leave policy rules require HR team onboarding assistance initially.',
      },
    ],
  },
];



async function seed() {
  console.log('\n🌱  SaaTerra — Seeding Software Catalog + Reviews into MongoDB…');
  console.log(`    Mode: ${IS_APPEND ? 'APPEND (existing data preserved)' : 'FRESH (existing data will be cleared)'}`);
  console.log(`    Total entries: ${SEED_DATA.length} software tools\n`);

  await mongoose.connect(MONGODB_URI, { bufferCommands: false });

  if (!IS_APPEND) {
    console.log('🗑️  Clearing existing Software and Review collections…');
    await Software.deleteMany({});
    await Review.deleteMany({});
    console.log('    ✔ Collections cleared.\n');
  }

  let softwareSeeded = 0;
  let reviewsSeeded  = 0;
  let skipped        = 0;

  for (const item of SEED_DATA) {
    const { reviews, ...softwareData } = item;

    try {
      if (IS_APPEND) {
        const existing = await Software.findOne({ slug: softwareData.slug });
        if (existing) {
          console.log(`    ⏭  Skipping (exists): ${softwareData.name}`);
          skipped++;
          continue;
        }
      }

      const createdSoftware = await Software.create(softwareData);
      softwareSeeded++;
      const cb = softwareData.cashbackActive ? `💰 ₹${softwareData.cashbackValue}` : '';
      const ft = softwareData.isFeatured     ? '⭐ Featured' : '';
      console.log(`    ✔ [${String(softwareSeeded).padStart(2,'0')}] ${createdSoftware.name.padEnd(28)} ${cb} ${ft}`);

      if (reviews && reviews.length > 0) {
        for (const rev of reviews) {
          await Review.create({ ...rev, softwareId: createdSoftware._id });
          reviewsSeeded++;
          console.log(`           └── 💬 ${rev.userName}: "${rev.reviewTitle}"`);
        }
      }
    } catch (err) {
      if (err.code === 11000) {
        console.warn(`    ⚠️  Duplicate skipped: ${softwareData.name}`);
        skipped++;
      } else {
        console.error(`    ❌ Error seeding ${softwareData.name}:`, err.message);
      }
    }
  }

  console.log('\n────────────────────────────────────────');
  console.log('🎉  Seed Complete!');
  console.log(`    ✅ Software seeded : ${softwareSeeded}`);
  console.log(`    💬 Reviews seeded  : ${reviewsSeeded}`);
  console.log(`    ⏭  Skipped         : ${skipped}`);
  console.log('────────────────────────────────────────\n');
}

seed()
  .then(() => { mongoose.connection.close(); process.exit(0); })
  .catch((err) => { console.error('❌ Seed error:', err); mongoose.connection.close(); process.exit(1); });
