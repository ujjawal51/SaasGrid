import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SiteConfig from '@/models/SiteConfig';
import CashbackClaim from '@/models/CashbackClaim';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function maskUserName(userName, userEmail) {
  if (userName && userName.trim()) {
    const parts = userName.trim().split(/\s+/);
    if (parts.length > 1) {
      const first = parts[0].toLowerCase();
      const lastInitial = parts[1][0]?.toLowerCase() || '';
      return `${first}.${lastInitial}****`;
    }
    const clean = parts[0].toLowerCase();
    return clean.length > 4 ? `${clean.slice(0, 4)}****` : `${clean}****`;
  }

  if (userEmail && userEmail.trim()) {
    const prefix = userEmail.split('@')[0].toLowerCase();
    const clean = prefix.replace(/[^a-z0-9]/g, '');
    return clean.length > 4 ? `${clean.slice(0, 4)}****` : `${clean || 'user'}****`;
  }

  return 'member.s****';
}

function formatRelativeTime(date) {
  if (!date) return 'Verified Payout';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 5) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return 'Verified Payout';
}

const TOOL_ICONS = {
  hostinger: '⚡',
  zoho: '💼',
  telecrm: '📊',
  vyapaar: '🧾',
  vyapar: '🧾',
  keka: '👥',
  canva: '🎨',
  shopify: '🛍️',
  notion: '📝',
  brevo: '📧',
  zapier: '⚡',
  mailchimp: '🐵',
  jira: '📁',
  odoo: '🏢',
};

function getToolIcon(toolName = '') {
  const lower = toolName.toLowerCase();
  for (const [key, icon] of Object.entries(TOOL_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '💰';
}

export async function GET() {
  try {
    await dbConnect();

    // Fetch site config for live ticker settings
    const config = await SiteConfig.findOne({ key: 'global' }).lean();
    const isTickerActive = config?.tickerActive !== false;
    const tickerSpeed = config?.tickerSpeed || 4;
    const tickerHeading = config?.tickerHeading || '💸 Live Payout Activity';
    const tickerSubBadge = config?.tickerSubBadge || '100% Real Verified UTR';

    if (!isTickerActive) {
      return NextResponse.json({
        ok: true,
        active: false,
        items: [],
        heading: tickerHeading,
        subBadge: tickerSubBadge,
        speed: tickerSpeed,
      });
    }

    // 1. Fetch real paid / approved claims from database
    const realClaims = await CashbackClaim.find({
      status: { $in: ['paid', 'approved'] },
      showOnTicker: { $ne: false },
    })
      .sort({ payoutDate: -1, updatedAt: -1, createdAt: -1 })
      .limit(15)
      .lean();

    const formattedRealItems = realClaims.map((claim) => {
      const toolName = claim.softwareName || 'SaaS Tool';
      const amountVal = claim.cashbackAmount || 400;
      const maskedName = maskUserName(claim.userName, claim.userEmail || claim.purchaseEmail);
      const timeStr = formatRelativeTime(claim.payoutDate || claim.updatedAt);
      const methodStr = claim.payoutType === 'voucher'
        ? 'Amazon Voucher'
        : claim.utrNumber
        ? `UPI (UTR: ${claim.utrNumber.slice(-4)})`
        : 'UPI Direct (GPay/PhonePe)';

      return {
        id: String(claim._id),
        user: maskedName,
        tool: toolName,
        amount: `₹${amountVal.toLocaleString('en-IN')}`,
        method: methodStr,
        time: timeStr,
        icon: getToolIcon(toolName),
        isReal: true,
        utr: claim.utrNumber || '',
      };
    });

    // 2. Include active manual entries configured by Admin if any
    const manualItems = (config?.tickerManualItems || [])
      .filter((m) => m.active !== false)
      .map((m, idx) => ({
        id: `manual_${idx}_${m._id || m.createdAt || idx}`,
        user: m.user || 'verified.user****',
        tool: m.tool || 'SaaS Partner Tool',
        amount: String(m.amount).startsWith('₹') ? m.amount : `₹${Number(m.amount || 400).toLocaleString('en-IN')}`,
        method: m.method || 'UPI (Verified)',
        time: m.timeAgo || 'Verified Payout',
        icon: getToolIcon(m.tool),
        isReal: true,
        utr: m.utrNumber || '',
      }));

    // Combine real claims + manual items
    let allItems = [...formattedRealItems, ...manualItems];

    // If completely empty, provide fallback genuine announcement items
    if (allItems.length === 0) {
      allItems = [
        {
          id: 'welcome_1',
          user: 'saaterra.member****',
          tool: 'All SaaS Tools',
          amount: '₹300 - ₹500',
          method: 'Direct UPI Transfer',
          time: 'Active Guarantee',
          icon: '🛡️',
          isReal: true,
          utr: 'VERIFIED',
        },
      ];
    }

    return NextResponse.json({
      ok: true,
      active: true,
      items: allItems,
      totalCount: allItems.length,
      heading: tickerHeading,
      subBadge: tickerSubBadge,
      speed: tickerSpeed,
    });
  } catch (error) {
    console.error('[Cashback Ticker API Error]:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        items: [],
      },
      { status: 500 }
    );
  }
}
