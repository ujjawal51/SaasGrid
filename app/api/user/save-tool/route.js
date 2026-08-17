import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Software from '@/models/Software';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to bookmark software.' }, { status: 401 });
    }

    const { softwareId } = await request.json();
    if (!softwareId) {
      return NextResponse.json({ error: 'Software ID is required.' }, { status: 400 });
    }

    await dbConnect();

    const [user, software] = await Promise.all([
      User.findById(authUser.userId),
      Software.findById(softwareId),
    ]);

    if (!user || !software) {
      return NextResponse.json({ error: 'User or Software not found.' }, { status: 404 });
    }

    const savedIndex = user.savedTools.findIndex((id) => id.toString() === softwareId);
    let isSaved = false;

    if (savedIndex > -1) {
      // Remove from saved tools
      user.savedTools.splice(savedIndex, 1);
      isSaved = false;
    } else {
      // Add to saved tools
      user.savedTools.push(software._id);
      isSaved = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      isSaved,
      message: isSaved ? 'Software saved to your bookmarks!' : 'Software removed from bookmarks.',
      savedCount: user.savedTools.length,
    });
  } catch (error) {
    console.error('[Save Tool API Error]:', error);
    return NextResponse.json({ error: 'Failed to bookmark software.' }, { status: 500 });
  }
}
