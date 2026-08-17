

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    // 1. Rate Limiting Check (Max 15 Google auth attempts per minute per IP)
    const { isRateLimited } = checkRateLimit(request, 'google-auth', 15, 60 * 1000);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many Google auth requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { credential, email, name, avatar } = body;

    // 2. Cryptographic Google ID Token Verification via Google TokenInfo API
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (!verifyRes.ok) {
          return NextResponse.json(
            { error: 'Google authentication failed: Invalid or expired ID Token.' },
            { status: 401 }
          );
        }

        const payload = await verifyRes.json();
        
        // Verify Client ID match if NEXT_PUBLIC_GOOGLE_CLIENT_ID is set
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (googleClientId && payload.aud !== googleClientId) {
          return NextResponse.json(
            { error: 'Google authentication security error: Client ID mismatch.' },
            { status: 401 }
          );
        }

        if (payload && payload.email) {
          email = payload.email;
          name = payload.name || payload.email.split('@')[0];
          avatar = payload.picture || avatar || null;
        }
      } catch (e) {
        console.error('[Google Auth Verification Error]:', e.message);
        return NextResponse.json(
          { error: 'Failed to verify Google token with Google servers.' },
          { status: 401 }
        );
      }
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Valid email address is required for Google authentication.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    await dbConnect();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create user if signing up via Google for the first time
      const randomSecret = crypto.randomBytes(24).toString('hex');
      const hashedPassword = await bcrypt.hash(randomSecret, 10);
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        avatar: avatar || null,
        role: 'user',
      });
    } else if (avatar && !user.avatar) {
      user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Authenticated with Google successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('[Google Auth API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Google authentication failed' },
      { status: 500 }
    );
  }
}
