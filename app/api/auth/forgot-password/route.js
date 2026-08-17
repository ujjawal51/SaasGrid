import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendResetEmail } from '@/lib/sendResetEmail';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate limiting (max 5 requests per 15 minutes per IP)
    const rl = rateLimit({ ip, limit: 5, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many password reset requests. Try again in ${rl.resetTime} seconds.` },
        { status: 429 }
      );
    }

    const { email } = await request.json();
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return generic success to prevent email enumeration
      return NextResponse.json({
        ok: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Generate secure random token & 1-hour expiration
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.saaterra.in';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    await sendResetEmail({
      toEmail: user.email,
      toName: user.name,
      resetUrl,
    });

    return NextResponse.json({
      ok: true,
      message: 'If an account exists with that email, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('[Forgot Password API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process request.' },
      { status: 500 }
    );
  }
}
