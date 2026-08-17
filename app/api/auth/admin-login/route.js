import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken, setAuthCookie, logAuditAction } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // Rate Limiting & Brute-Force Protection (Max 5 attempts per 15 minutes)
    const { isRateLimited } = checkRateLimit(request, 'admin-login', 5, 15 * 60 * 1000);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many failed admin attempts. Locked out for 15 minutes.' },
        { status: 429 }
      );
    }

    const { email, password, adminSecretKey } = await request.json();

    if (!email || !password || !adminSecretKey) {
      return NextResponse.json(
        { error: 'Email, password, and Master Admin Secret Key (PIN) are required.' },
        { status: 400 }
      );
    }

    // Verify Master Admin Secret Key (PIN)
    const masterKey = process.env.ADMIN_SECRET_KEY;
    if (!masterKey || adminSecretKey.trim() !== masterKey.trim()) {
      await logAuditAction({
        adminEmail: email,
        action: 'FAILED_ADMIN_PIN_ATTEMPT',
        target: email,
        details: 'Incorrect Master Admin Secret Key (PIN)',
        req: request,
      });
      return NextResponse.json(
        { error: 'Invalid Master Admin Secret Key (PIN).' },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logAuditAction({
        adminEmail: email,
        action: 'FAILED_ADMIN_LOGIN_ATTEMPT',
        target: email,
        details: 'Incorrect password on Admin Login',
        req: request,
      });
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // Elevate / set user role to admin
    user.role = 'admin';
    await user.save();

    await logAuditAction({
      adminEmail: user.email,
      action: 'ADMIN_LOGIN_SUCCESS_VIA_PIN',
      target: user.email,
      details: 'Logged into admin session via Master Admin PIN',
      req: request,
    });

    const token = generateToken(user);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[Admin Login API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate admin' },
      { status: 500 }
    );
  }
}
