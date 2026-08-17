import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL('/login?error=google_denied', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${new URL(request.url).origin}/api/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('[Google OAuth Token Error]:', tokenData);
      return NextResponse.redirect(new URL('/login?error=token_failed', request.url));
    }

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userInfoRes.json();

    if (!userInfo.email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url));
    }

    // Find or create user in DB
    await dbConnect();

    let user = await User.findOne({ email: userInfo.email.toLowerCase() });

    if (!user) {
      const randomSecret = crypto.randomBytes(24).toString('hex');
      const hashedPassword = await bcrypt.hash(randomSecret, 10);
      user = await User.create({
        name: userInfo.name || userInfo.email.split('@')[0],
        email: userInfo.email.toLowerCase(),
        password: hashedPassword,
        avatar: userInfo.picture || null,
        role: 'user',
      });
    } else if (userInfo.picture && !user.avatar) {
      user.avatar = userInfo.picture;
      await user.save();
    }

    // Generate JWT and set cookie
    const token = generateToken(user);
    await setAuthCookie(token);

    // Redirect to homepage after successful login
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('[Google OAuth Callback Error]:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
