

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import { getAuthUser } from '@/lib/auth';

import Submission from '@/models/Submission';

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in or signed up to submit software.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      tagline,
      description,
      categorySlug,
      pricingType,
      startingPrice,
      billingCycle,
      affiliateLink,
      logo,
      pros,
      cons,
      submitterName,
      submitterEmail,
      submitterPhone,
    } = body;

    if (!name || !tagline || !categorySlug || !affiliateLink) {
      return NextResponse.json(
        { error: 'Name, Tagline, Category, and Website/Affiliate Link are required.' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required (mandatory).' },
        { status: 400 }
      );
    }

    const wordCount = description.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount > 500) {
      return NextResponse.json(
        { error: `Description must be under 500 words (current: ${wordCount} words).` },
        { status: 400 }
      );
    }

    let finalLogo = logo?.trim() || null;
    if ((!finalLogo || finalLogo.includes('logo.clearbit.com')) && affiliateLink) {
      try {
        let urlStr = affiliateLink.trim();
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
          urlStr = 'https://' + urlStr;
        }
        const host = new URL(urlStr).hostname.replace(/^www\./, '');
        if (host) {
          finalLogo = `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
        }
      } catch {}
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await dbConnect();

    const existing = await Software.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: 'A software with a similar name already exists.' },
        { status: 400 }
      );
    }

    const cleanPros = Array.isArray(pros) ? pros : pros ? pros.split('\n').filter(Boolean) : [];
    const cleanCons = Array.isArray(cons) ? cons : cons ? cons.split('\n').filter(Boolean) : [];

    // Create submission entry for Admin Moderation
    const submission = await Submission.create({
      userId: user.userId || user._id || null,
      userEmail: (user.email || submitterEmail || '').toLowerCase().trim(),
      name: name.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      categorySlug: categorySlug.trim().toLowerCase(),
      pricingType: pricingType || 'Paid',
      startingPrice: startingPrice ? Number(startingPrice) : 0,
      billingCycle: billingCycle || 'Monthly',
      affiliateLink: affiliateLink.trim(),
      logo: finalLogo,
      pros: cleanPros,
      cons: cleanCons,
      submitterName: (submitterName || user.name || '').trim(),
      submitterEmail: (submitterEmail || user.email || 'vendor@saaterra.in').toLowerCase().trim(),
      submitterPhone: (submitterPhone || '').trim(),
      status: 'pending',
      consentStatus: 'pending_consent',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Software submitted successfully! It is pending Admin review and will be published once approved.',
        submission,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Software Submit Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit software' },
      { status: 500 }
    );
  }
}
