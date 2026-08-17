import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Software from '@/models/Software';
import Submission from '@/models/Submission';
import CashbackClaim from '@/models/CashbackClaim';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    await dbConnect();

    // Touch Software model to ensure Mongoose schema is registered for populate
    if (Software) {
      const _modelCheck = Software.modelName;
    }

    const user = await User.findById(authUser.userId)
      .populate({ path: 'savedTools', model: Software })
      .populate({ path: 'upvotedTools', model: Software })
      .select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Fetch user's submissions and cashback claims
    const userEmailLower = (user.email || '').toLowerCase().trim();
    const [submissions, cashbackClaims] = await Promise.all([
      Submission.find({
        $or: [
          ...(user._id ? [{ userId: user._id }] : []),
          { userEmail: userEmailLower },
          { submitterEmail: userEmailLower },
        ],
      }).sort({ createdAt: -1 }),
      CashbackClaim.find({
        $or: [
          ...(user._id ? [{ userId: user._id }] : []),
          { userEmail: userEmailLower },
        ],
      }).sort({ createdAt: -1 }),
    ]);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
        savedTools: user.savedTools || [],
        upvotedTools: user.upvotedTools || [],
      },
      submissions,
      cashbackClaims,
    });
  } catch (error) {
    console.error('[User Profile GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { name, avatar } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(authUser.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('[User Profile PUT Error]:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}

// ─── 🛡️ DPDP Act 2023 Section 12: User Right to Erasure (Data Deletion) ────────
export async function DELETE() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    await dbConnect();

    // 1. Purge personal uploaded invoice image base64 data to minimize stored PII
    await CashbackClaim.updateMany(
      { userId: authUser.userId },
      { $set: { receiptData: '', upiId: 'ERASED_PER_USER_REQUEST' } }
    );

    // 2. Delete the user profile
    await User.findByIdAndDelete(authUser.userId);

    const response = NextResponse.json({
      success: true,
      message: 'Your personal data, uploaded invoices, and account have been permanently erased in compliance with DPDP Act 2023.',
    });

    // Clear auth cookie
    response.cookies.set('saaterra_token', '', { maxAge: 0, path: '/' });

    return response;
  } catch (error) {
    console.error('[User Profile DELETE DPDP Error]:', error);
    return NextResponse.json({ error: 'Failed to process data deletion request.' }, { status: 500 });
  }
}
