import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Inquiry from '@/models/Inquiry';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      type,
      companyName,
      websiteUrl,
      contactName,
      email,
      phone,
      subject,
      message,
      targetCategory,
    } = body;

    if (!contactName || !email) {
      return NextResponse.json(
        { error: 'Contact Name and Business Email are required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const inquiry = await Inquiry.create({
      type: type || 'ad_request',
      companyName: (companyName || '').trim(),
      websiteUrl: (websiteUrl || '').trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      subject: (subject || (type === 'ad_request' ? 'Ad & Partnership Inquiry' : 'Support Query')).trim(),
      message: (message || targetCategory || '').trim(),
      targetCategory: (targetCategory || '').trim(),
      status: 'unread',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry received successfully! Our team will contact you shortly.',
        inquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Inquiry POST Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send inquiry' },
      { status: 500 }
    );
  }
}
