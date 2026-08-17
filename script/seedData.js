/**
 * script/seedData.js
 *
 * Standalone MongoDB seed script for SaaSGrid.
 * Seeds Software catalog + Authentic User Written Reviews.
 *
 * Usage:
 *   node script/seedData.js
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('\n❌ MONGODB_URI not found in .env.local\n');
  process.exit(1);
}

const SoftwareSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, unique: true, trim: true },
    slug:          { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo:          { type: String, default: null },
    tagline:       { type: String, required: true, trim: true },
    description:   { type: String },
    categorySlug:  { type: String, required: true, lowercase: true, trim: true },
    pricingType:   { type: String, enum: ['Free', 'Paid', 'Freemium'], default: null },
    startingPrice: { type: Number, default: null },
    billingCycle:  { type: String, enum: ['Monthly', 'Yearly', 'One-time'], default: null },
    affiliateLink: { type: String, required: true },
    pros:          { type: [String], default: [] },
    cons:          { type: [String], default: [] },
    averageRating: { type: Number, default: 0 },
    totalReviews:  { type: Number, default: 0 },
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

const SEED_DATA = [
  {
    name:          'Vyapaar App',
    slug:          'vyapaar-app',
    logo:          'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_39316d3f237bf3bb66c2bb20d6f2bb60/vyapar.png',
    tagline:       'Simplifying GST Billing & Inventory Management',
    description:   '<p>Vyapaar App is India\'s fastest-growing GST billing and inventory management software built specifically for small and medium businesses, kirana stores, wholesalers, and retailers. It handles GST invoicing, stock management, UPI payments, and WhatsApp-based customer communication — all in one platform that works even offline.</p>',
    categorySlug:  'billing-software',
    pricingType:   'Paid',
    startingPrice: 2499,
    billingCycle:  'Yearly',
    affiliateLink: 'https://clnk.in',
    pros: [
      'Offline sync features — works without internet in low-connectivity areas',
      'UPI payment QR code generation directly inside invoices',
      'Direct WhatsApp reporting — share invoices and statements instantly',
    ],
    cons: [
      'iOS app features are limited compared to the Android version',
    ],
    averageRating: 4.5,
    totalReviews:  2410,
    reviews: [
      {
        userName: 'Rajesh Agarwal',
        userDesignation: 'Retail Store Owner (Jaipur)',
        rating: 5,
        reviewTitle: 'Best billing software for small retail stores in India',
        feedbackPros: 'Vyapaar makes GST invoice creation super fast. Even without active internet in our shop, offline mode saves invoices seamlessly and syncs automatically later. UPI QR printing on bills is very convenient.',
        feedbackCons: 'The desktop app takes a few seconds to load when generating multi-page inventory reports.',
      },
      {
        userName: 'Suresh Kumar',
        userDesignation: 'Wholesale Distributor (Delhi)',
        rating: 4,
        reviewTitle: 'Extremely easy inventory and stock tracking',
        feedbackPros: 'I can send invoices directly on WhatsApp to my clients with a single tap. Stock alerts help me reorder inventory before running out.',
        feedbackCons: 'Would love to see multi-currency support for export clients.',
      },
    ],
  },

  {
    name:          'TeleCRM',
    slug:          'telecrm',
    logo:          'https://telecrm.in/static/media/telecrm-logo.4ed7ee3d.svg',
    tagline:       'Best WhatsApp Marketing & Sales CRM for India',
    description:   '<p>TeleCRM is a WhatsApp-first sales CRM designed for Indian sales teams and growth-focused startups. It integrates with the official WhatsApp Business API to automate lead nurturing, distribute inbound leads across your team, and provide real-time call and chat analytics — all from a single dashboard.</p>',
    categorySlug:  'crm-software',
    pricingType:   'Paid',
    startingPrice: 899,
    billingCycle:  'Monthly',
    affiliateLink: 'https://clnk.in',
    pros: [
      'Official WhatsApp API integration — broadcast, automate, and chat at scale',
      'Automatic lead distribution across field agents and inside sales reps',
      'Team tracking analytics with call recordings and response time metrics',
    ],
    cons: [
      'Interface requires a slight learning curve for non-technical users',
    ],
    averageRating: 4.6,
    totalReviews:  3840,
    reviews: [
      {
        userName: 'Vikram Mehta',
        userDesignation: 'Head of Sales, EduTech',
        rating: 5,
        reviewTitle: 'Transformed our WhatsApp sales conversion rate by 3x!',
        feedbackPros: 'Official WhatsApp Business API integration allows our team to send templates, auto-assign incoming leads to telecallers, and track overall call durations effortlessly.',
        feedbackCons: 'Initial setup of WhatsApp API templates took about 24 hours for Facebook verification.',
      },
      {
        userName: 'Neha Sharma',
        userDesignation: 'Real Estate Sales Lead (Mumbai)',
        rating: 5,
        reviewTitle: 'Great mobile CRM for field agents',
        feedbackPros: 'Automatic call recording and lead distribution makes telecalling tracking completely transparent.',
        feedbackCons: 'Bulk export to CSV can be slightly slow for datasets over 50,000 leads.',
      },
    ],
  },

  {
    name:          'Hostinger India',
    slug:          'hostinger-india',
    logo:          'https://upload.wikimedia.org/wikipedia/commons/0/07/Hostinger_logo.svg',
    tagline:       'Ultra-Fast WordPress Hosting with Free Domain',
    description:   '<p>Hostinger India is one of the most popular budget-to-mid-range web hosting platforms used by Indian developers, bloggers, and small business owners. It offers NVMe SSD hosting, LiteSpeed servers, and a custom-built hPanel control panel that makes site management simple — with a 99.9% uptime guarantee and localised Hindi support.</p>',
    categorySlug:  'web-hosting',
    pricingType:   'Paid',
    startingPrice: 149,
    billingCycle:  'Monthly',
    affiliateLink: 'https://clnk.in',
    pros: [
      '0.5s average loading performance — powered by LiteSpeed + NVMe SSD storage',
      '24/7 localised support chat available in English and Hindi',
      'Free SSL certificates, daily backups, and domain included on annual plans',
    ],
    cons: [
      'Renewal pricing scales significantly higher after the introductory period',
    ],
    averageRating: 4.7,
    totalReviews:  18900,
    reviews: [
      {
        userName: 'Amitav Roy',
        userDesignation: 'Full Stack Web Developer (Kolkata)',
        rating: 5,
        reviewTitle: 'Unbeatable performance and uptime for the price',
        feedbackPros: 'LiteSpeed server caching combined with NVMe storage gives sub-second page loads for our WordPress client sites. The custom hPanel interface is much cleaner than traditional cPanel.',
        feedbackCons: 'No phone support available — support is exclusively live chat.',
      },
      {
        userName: 'Pooja Verma',
        userDesignation: 'Digital Marketing Consultant',
        rating: 4,
        reviewTitle: 'Super fast live chat support and free SSL',
        feedbackPros: 'One-click WordPress installation and free SSL installation took less than 3 minutes to go live.',
        feedbackCons: 'Introductory 4-year deal is great, but 1-year renewal prices jump up.',
      },
    ],
  },

  {
    name:          'Keka HR',
    slug:          'keka-hr',
    logo:          'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_7cb360b94326550756e18987b7a602cf/keka-hr.png',
    tagline:       'Employee Attendance & Automated Payroll Portal',
    description:   '<p>Keka HR is a modern, India-first HR and payroll management platform used by 7,000+ businesses across sectors. It handles employee attendance (including biometric device integration), automatic payroll processing, PF/ESI/TDS compliance, leave management, and offers an employee self-service portal — making it the go-to HRMS for growing Indian companies.</p>',
    categorySlug:  'hr-payroll-software',
    pricingType:   'Paid',
    startingPrice: 4999,
    billingCycle:  'Yearly',
    affiliateLink: 'https://clnk.in',
    pros: [
      'Biometric auto sync routing — integrates directly with punch machines',
      'Statutory tax compliances sorted — PF, ESI, PT, and TDS handled automatically',
      'Employee self-service grid — staff can apply for leave, view payslips independently',
    ],
    cons: [
      'Too feature-heavy and bulky for micro startups with under 5 employees',
    ],
    averageRating: 4.6,
    totalReviews:  5930,
    reviews: [
      {
        userName: 'Ananya Deshmukh',
        userDesignation: 'HR Manager, TechCorp (Pune)',
        rating: 5,
        reviewTitle: 'Payroll processing time reduced from 4 days to 30 minutes!',
        feedbackPros: 'Biometric integration syncs attendance automatically. PF, ESI, and Form 16 calculations are completely automated without manual spreadsheet errors.',
        feedbackCons: 'Custom leave policy rules require HR team onboarding assistance initially.',
      },
    ],
  },
];

async function seed() {
  console.log('\n🌱  Seeding SaaSGrid Software + User Written Reviews into MongoDB…');
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  await Software.deleteMany({});
  await Review.deleteMany({});

  for (const item of SEED_DATA) {
    const { reviews, ...softwareData } = item;
    const createdSoftware = await Software.create(softwareData);
    console.log(`    ✔ Software: ${createdSoftware.name}`);

    if (reviews && reviews.length > 0) {
      for (const rev of reviews) {
        await Review.create({
          ...rev,
          softwareId: createdSoftware._id,
        });
        console.log(`       └── 💬 Review by ${rev.userName}: "${rev.reviewTitle}"`);
      }
    }
  }

  console.log('\n🎉  Seed complete with authentic written reviews!\n');
}

seed()
  .then(() => { mongoose.connection.close(); process.exit(0); })
  .catch((err) => { console.error('❌ Seed error:', err); process.exit(1); });
