

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { validatePassword, validateEmail, sanitizeInput } from '@/lib/security';

export async function POST(request) {
  try {
    const { isRateLimited } = checkRateLimit(request, 'signup', 5, 60 * 1000);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many account creation attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    // 1. Validate and sanitize Email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // 2. Validate Strong Password (Min 8 chars, uppercase, lowercase, number, special char)
    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      return NextResponse.json(
        { error: passValidation.error },
        { status: 400 }
      );
    }

    const sanitizedName = sanitizeInput(name);
    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid full name.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ email: emailValidation.sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: sanitizedName,
      email: emailValidation.sanitizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(newUser);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Signup API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
