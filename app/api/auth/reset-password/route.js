import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { checkRateLimit } from '@/lib/rateLimit';
import { validatePassword } from '@/lib/security';

export async function POST(request) {
  try {
    const { isRateLimited } = checkRateLimit(request, 'reset-password', 5, 15 * 60 * 1000);
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again after 15 minutes.' },
        { status: 429 }
      );
    }

    const { token, newPassword } = await request.json();

    if (!token || !token.trim()) {
      return NextResponse.json(
        { error: 'Reset token is required.' },
        { status: 400 }
      );
    }

    const passValidation = validatePassword(newPassword);
    if (!passValidation.valid) {
      return NextResponse.json(
        { error: passValidation.error },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({
      resetPasswordToken: token.trim(),
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Password reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password and clear reset token fields
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return NextResponse.json({
      ok: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('[Reset Password API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
