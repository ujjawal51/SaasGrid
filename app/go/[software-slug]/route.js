

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import Analytics from '@/models/Analytics';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; 
const COOKIE_PATH    = '/';

function generateClickId(slug) {
  const ts  = Date.now();
  const rand = crypto.randomBytes(3).toString('hex'); 
  return `sg_${slug}_${ts}_${rand}`;
}

function buildTrackedUrl(rawAffiliateUrl, slug, clickId) {
  try {
    const url = new URL(rawAffiliateUrl);

    url.searchParams.set('ref',          'saaterra');
    url.searchParams.set('utm_source',   'saaterra');
    url.searchParams.set('utm_medium',   'affiliate');
    url.searchParams.set('utm_campaign', slug);
    url.searchParams.set('utm_content',  clickId);   

    return url.toString();
  } catch {
    
    const sep = rawAffiliateUrl.includes('?') ? '&' : '?';
    return `${rawAffiliateUrl}${sep}ref=saaterra&utm_source=saaterra&utm_medium=affiliate&utm_campaign=${slug}&utm_content=${encodeURIComponent(clickId)}`;
  }
}

export async function GET(request, context) {
  try {
    const params      = await context.params;
    const rawSlug     = params['software-slug'] || params.softwareSlug;
    const softwareSlug = rawSlug?.trim().toLowerCase();

    if (!softwareSlug) {
      return NextResponse.redirect(new URL('/', request.url), { status: 302 });
    }

    const clickId  = generateClickId(softwareSlug);
    const clickTs  = String(Date.now());

    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const ip           = forwardedFor.split(',')[0].trim()
                      || request.headers.get('x-real-ip')
                      || '127.0.0.1';
    const userAgent    = request.headers.get('user-agent') || 'browser';
    const cookieVid    = request.cookies.get('saaterra_vid')?.value || 'anon';
    const referrer     = request.headers.get('referer') || null;
    const todayDateStr = new Date().toISOString().split('T')[0];

    const visitorHash = crypto
      .createHash('md5')
      .update(`${cookieVid}-${ip}-${userAgent}-${todayDateStr}`)
      .digest('hex');

    const ua = userAgent.toLowerCase();
    const deviceType = /mobile|android|iphone/.test(ua)
      ? 'Mobile'
      : /tablet|ipad/.test(ua)
        ? 'Tablet'
        : 'Desktop';

    await dbConnect();

    const software = await Software.findOne({
      $or: [
        { slug: softwareSlug },
        { slug: new RegExp(`^${softwareSlug}`, 'i') },
      ],
    })
      .select('affiliateLink slug couponCode couponActive')
      .lean();

    let rawDestination;
    if (software?.affiliateLink) {
      rawDestination = software.affiliateLink;
    } else {
      
      const cleanDomain  = softwareSlug.replace(/[^a-z0-9]/g, '');
      rawDestination = `https://${cleanDomain}.com/`;
    }

    const trackedUrl = buildTrackedUrl(rawDestination, softwareSlug, clickId);

    Analytics.create({
      eventType:      'affiliate_redirect',
      visitorHash,
      softwareSlug,
      path:           `/go/${softwareSlug}`,
      deviceType,
      clickId,
      referrer,
      couponCode:     software?.couponActive ? (software?.couponCode || null) : null,
      destinationUrl: trackedUrl,
    }).catch((err) =>
      console.error('[Affiliate Click Log Error]:', err.message)
    );

    const response = NextResponse.redirect(trackedUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma':        'no-cache',
        'Expires':       '0',
      },
    });

    response.cookies.set('saaterra_click_id', clickId, {
      maxAge:   COOKIE_MAX_AGE,
      path:     COOKIE_PATH,
      sameSite: 'lax',
      httpOnly: false, 
      secure:   process.env.NODE_ENV === 'production',
    });

    response.cookies.set('saaterra_ref', softwareSlug, {
      maxAge:   COOKIE_MAX_AGE,
      path:     COOKIE_PATH,
      sameSite: 'lax',
      httpOnly: false,
      secure:   process.env.NODE_ENV === 'production',
    });

    response.cookies.set('saaterra_ts', clickTs, {
      maxAge:   COOKIE_MAX_AGE,
      path:     COOKIE_PATH,
      sameSite: 'lax',
      httpOnly: false,
      secure:   process.env.NODE_ENV === 'production',
    });

    if (software?.couponActive && software?.couponCode) {
      response.cookies.set('saaterra_coupon', software.couponCode, {
        maxAge:   COOKIE_MAX_AGE,
        path:     COOKIE_PATH,
        sameSite: 'lax',
        httpOnly: false,
        secure:   process.env.NODE_ENV === 'production',
      });
    }

    return response;

  } catch (error) {
    console.error('[Affiliate Cloaking Engine Error]:', error.message);
    return NextResponse.redirect(new URL('/', request.url), { status: 302 });
  }
}
