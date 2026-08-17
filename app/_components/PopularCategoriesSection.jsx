'use client';

import { useState } from 'react';
import Link from 'next/link';

const CATEGORIES_DATA = [
  {
    id: 'billing-software',
    name: 'GST Billing & Invoicing',
    seeAllLink: '/category/billing-software',
    tools: [
      { name: 'Vyapaar App', slug: 'vyapaar-app', logo: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_39316d3f237bf3bb66c2bb20d6f2bb60/vyapar.png', rating: 4.5, reviews: '2,410', price: '₹2,499/yr' },
      { name: 'Zoho Books', slug: 'zoho-books', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Zoho_Logo.svg', rating: 4.7, reviews: '14,820', price: '₹749/mo' },
      { name: 'Tally Prime', slug: 'tally-prime', logo: 'https://tallysolutions.com/wp-content/uploads/2020/11/TallyPrime-Logo.svg', rating: 4.6, reviews: '22,400', price: '₹18,000' },
      { name: 'MyBillBook', slug: 'mybillbook', logo: '📱', rating: 4.4, reviews: '8,930', price: '₹1,299/yr' },
      { name: 'ClearTax GST', slug: 'cleartax-gst', logo: '📑', rating: 4.5, reviews: '11,200', price: '₹3,999/yr' },
      { name: 'Khatabook', slug: 'khatabook', logo: '📕', rating: 4.3, reviews: '18,500', price: 'Free' },
      { name: 'BUSY Accounting', slug: 'busy-accounting', logo: '💼', rating: 4.4, reviews: '6,700', price: '₹7,200/yr' },
      { name: 'Marg ERP 9+', slug: 'marg-erp', logo: '🏢', rating: 4.2, reviews: '9,120', price: '₹8,999/yr' },
      { name: 'ProfitBooks', slug: 'profitbooks', logo: '📈', rating: 4.3, reviews: '3,450', price: 'Free / Paid' },
    ],
  },
  {
    id: 'crm-software',
    name: 'CRM & Sales Automation',
    seeAllLink: '/category/crm-software',
    tools: [
      { name: 'TeleCRM', slug: 'telecrm', logo: 'https://telecrm.in/static/media/telecrm-logo.4ed7ee3d.svg', rating: 4.6, reviews: '3,840', price: '₹899/mo' },
      { name: 'Zoho CRM', slug: 'zoho-crm', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Zoho_Logo.svg', rating: 4.7, reviews: '21,300', price: '₹1,300/mo' },
      { name: 'HubSpot CRM', slug: 'hubspot', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg', rating: 4.8, reviews: '19,500', price: 'Free / Paid' },
      { name: 'Freshsales', slug: 'freshsales', logo: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_9e47265a7d30f406bb1a0d8a5fa325d7/freshsales.png', rating: 4.5, reviews: '8,400', price: '₹999/mo' },
      { name: 'LeadSquared', slug: 'leadsquared', logo: '📐', rating: 4.4, reviews: '5,200', price: '₹1,250/mo' },
      { name: 'Salesforce CRM', slug: 'salesforce', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg', rating: 4.7, reviews: '31,000', price: '$25/mo' },
      { name: 'Pipedrive', slug: 'pipedrive', logo: '🟢', rating: 4.6, reviews: '12,100', price: '$14/mo' },
      { name: 'EngageBay', slug: 'engagebay', logo: '🎯', rating: 4.4, reviews: '2,900', price: 'Free / $11.99' },
      { name: 'Bitrix24', slug: 'bitrix24', logo: '🔵', rating: 4.3, reviews: '7,800', price: 'Free / Paid' },
    ],
  },
  {
    id: 'web-hosting',
    name: 'Web Hosting & Servers',
    seeAllLink: '/category/web-hosting',
    tools: [
      { name: 'Hostinger India', slug: 'hostinger-india', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/07/Hostinger_logo.svg', rating: 4.7, reviews: '18,900', price: '₹149/mo' },
      { name: 'Bluehost', slug: 'bluehost', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Bluehost_Logo.svg', rating: 4.5, reviews: '14,200', price: '₹169/mo' },
      { name: 'Cloudways', slug: 'cloudways', logo: '☁️', rating: 4.8, reviews: '6,400', price: '$11/mo' },
      { name: 'SiteGround', slug: 'siteground', logo: '⚙️', rating: 4.7, reviews: '11,800', price: '$2.99/mo' },
      { name: 'A2 Hosting', slug: 'a2-hosting', logo: '⚡', rating: 4.4, reviews: '5,100', price: '$2.99/mo' },
      { name: 'DigitalOcean', slug: 'digitalocean', logo: '💧', rating: 4.8, reviews: '9,800', price: '$4/mo' },
      { name: 'HostGator', slug: 'hostgator', logo: '🐊', rating: 4.2, reviews: '16,500', price: '₹149/mo' },
      { name: 'Vultr', slug: 'vultr', logo: '🚀', rating: 4.6, reviews: '4,300', price: '$2.50/mo' },
      { name: 'Namecheap', slug: 'namecheap', logo: '🏷️', rating: 4.4, reviews: '13,100', price: '₹198/mo' },
    ],
  },
  {
    id: 'hr-payroll-software',
    name: 'HR & Payroll Suites',
    seeAllLink: '/category/hr-payroll-software',
    tools: [
      { name: 'Keka HR', slug: 'keka-hr', logo: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_7cb360b94326550756e18987b7a602cf/keka-hr.png', rating: 4.6, reviews: '5,930', price: '₹4,999/yr' },
      { name: 'GreytHR', slug: 'greythr', logo: 'https://images.g2crowd.com/uploads/product/image/large_detail/large_detail_47a46e165487cfca3b5c3bc27137f867/greythr.png', rating: 4.5, reviews: '8,400', price: '₹3,495/mo' },
      { name: 'Zoho People', slug: 'zoho-people', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Zoho_Logo.svg', rating: 4.6, reviews: '11,200', price: '₹48/user' },
      { name: 'Pocket HRMS', slug: 'pocket-hrms', logo: '💼', rating: 4.3, reviews: '3,100', price: '₹1,499/mo' },
      { name: 'Darwinbox', slug: 'darwinbox', logo: '📦', rating: 4.7, reviews: '4,800', price: 'Contact Sales' },
      { name: 'RazorpayX Payroll', slug: 'razorpayx-payroll', logo: '💳', rating: 4.6, reviews: '2,900', price: '₹100/user' },
      { name: 'HROne', slug: 'hrone', logo: '1️⃣', rating: 4.4, reviews: '2,100', price: 'Contact Sales' },
      { name: 'SumoHR', slug: 'sumohr', logo: '🤼', rating: 4.3, reviews: '1,800', price: '₹49/user' },
      { name: 'Spine HR', slug: 'spine-hr', logo: '🦴', rating: 4.2, reviews: '2,400', price: 'Contact Sales' },
    ],
  },
  {
    id: 'ecommerce-software',
    name: 'E-Commerce Platforms',
    seeAllLink: '/category/ecommerce-software',
    tools: [
      { name: 'Shopify', slug: 'shopify', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg', rating: 4.8, reviews: '24,500', price: '₹1,999/mo' },
      { name: 'WooCommerce', slug: 'woocommerce', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/WooCommerce_logo.svg', rating: 4.6, reviews: '18,200', price: 'Free Plugin' },
      { name: 'Dukaan', slug: 'dukaan', logo: '🏪', rating: 4.4, reviews: '6,900', price: '₹6,999/yr' },
      { name: 'Wix eCommerce', slug: 'wix-ecommerce', logo: '✨', rating: 4.5, reviews: '15,100', price: '₹225/mo' },
      { name: 'Instamojo', slug: 'instamojo', logo: '⚡', rating: 4.3, reviews: '9,400', price: 'Free / 5%' },
      { name: 'BigCommerce', slug: 'bigcommerce', logo: '🏬', rating: 4.6, reviews: '7,100', price: '$29/mo' },
      { name: 'Magento', slug: 'magento', logo: '🟧', rating: 4.4, reviews: '8,800', price: 'Open Source' },
      { name: 'Shiprocket', slug: 'shiprocket', logo: '🚀', rating: 4.5, reviews: '12,300', price: 'Free / Paid' },
      { name: 'OpenCart', slug: 'opencart', logo: '🛒', rating: 4.2, reviews: '4,900', price: 'Open Source' },
    ],
  },
  {
    id: 'ai-tools',
    name: 'AI Productivity Tools',
    seeAllLink: '/category/ai-tools',
    tools: [
      { name: 'ChatGPT Plus', slug: 'chatgpt-plus', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', rating: 4.9, reviews: '45,000', price: '$20/mo' },
      { name: 'Notion AI', slug: 'notion-ai', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg', rating: 4.7, reviews: '13,718', price: '$10/mo' },
      { name: 'Canva AI', slug: 'canva', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg', rating: 4.8, reviews: '22,400', price: 'Free / Paid' },
      { name: 'Midjourney', slug: 'midjourney', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png', rating: 4.8, reviews: '16,400', price: '$10/mo' },
      { name: 'Copy.ai', slug: 'copy-ai', logo: '📄', rating: 4.5, reviews: '7,200', price: 'Free / $36' },
      { name: 'Descript', slug: 'descript', logo: '🎙️', rating: 4.6, reviews: '5,800', price: 'Free / $12' },
      { name: 'Synthesia', slug: 'synthesia', logo: '🎥', rating: 4.7, reviews: '3,900', price: '$30/mo' },
      { name: 'Otter.ai', slug: 'otter-ai', logo: '🦦', rating: 4.5, reviews: '6,100', price: 'Free / $8.33' },
      { name: 'Grammarly GO', slug: 'grammarly-go', logo: '🟢', rating: 4.7, reviews: '28,900', price: 'Free / $12' },
    ],
  },
];

function G2Stars({ rating }) {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < full ? 'text-rose-500 fill-rose-500' : 'text-slate-700 fill-slate-700'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function PopularCategoriesSection() {
  const [activeTabId, setActiveTabId] = useState(CATEGORIES_DATA[0].id);

  const activeCategory = CATEGORIES_DATA.find((c) => c.id === activeTabId) || CATEGORIES_DATA[0];

  return (
    <section className="py-12 bg-[#0B192C]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

          {}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Most Popular Software Categories
            </h2>

            <div className="space-y-1">
              {CATEGORIES_DATA.map((cat) => {
                const isActive = cat.id === activeTabId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTabId(cat.id)}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-between
                      ${
                        isActive
                          ? 'border-2 border-rose-500 bg-rose-500/10 text-rose-400 shadow-md shadow-rose-500/10 font-bold'
                          : 'border border-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }
                    `}
                  >
                    <span>{cat.name}</span>
                    {isActive && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {}
          <div className="space-y-4 min-w-0">
            <div className="flex justify-end">
              <Link
                href={activeCategory.seeAllLink}
                className="text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 group"
              >
                See all {activeCategory.name} Software
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeCategory.tools.map((tool) => {
                const isUrl = tool.logo && tool.logo.startsWith('http');
                const isEmoji = tool.logo && tool.logo.length <= 4;

                return (
                  <Link
                    key={tool.name}
                    href={`/software/${tool.slug}`}
                    className="group relative flex flex-col items-center justify-between rounded-2xl border border-slate-700/60 bg-[#0d1c2e] p-5 text-center transition-all duration-200 hover:border-rose-500/40 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-rose-500/5 min-h-[160px]"
                  >
                    <div className="w-full space-y-1">
                      <p className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                        {tool.name}
                      </p>

                      <div className="flex items-center justify-center gap-1.5">
                        <G2Stars rating={tool.rating} />
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({tool.reviews})
                        </span>
                      </div>
                    </div>

                    {/* Software Logo */}
                    <div className="my-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/60 p-2.5 shadow-md backdrop-blur-sm group-hover:scale-110 group-hover:border-sky-500/40 transition-transform overflow-hidden">
                      {isUrl ? (
                        <img src={tool.logo} alt={`${tool.name} logo`} referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain drop-shadow-md" />
                      ) : isEmoji ? (
                        <span className="text-2xl">{tool.logo}</span>
                      ) : (
                        <span className="font-extrabold text-white text-lg">{tool.name[0]}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full pt-1">
                      <p className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-300 truncate">
                        {tool.price}
                      </p>
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/35 px-1.5 py-0.2 text-[8px] font-black text-emerald-400 shrink-0">
                        💰 Cashback
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
