import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Software from '@/models/Software';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to upvote tools.' }, { status: 401 });
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

    const upvotedIndex = user.upvotedTools.findIndex((id) => id.toString() === softwareId);
    let isUpvoted = false;

    if (upvotedIndex > -1) {
      // Remove upvote
      user.upvotedTools.splice(upvotedIndex, 1);
      software.upvotes = Math.max(0, (software.upvotes || 1) - 1);
      isUpvoted = false;
    } else {
      // Add upvote
      user.upvotedTools.push(software._id);
      software.upvotes = (software.upvotes || 0) + 1;
      isUpvoted = true;
    }

    await Promise.all([user.save(), software.save()]);

    return NextResponse.json({
      success: true,
      isUpvoted,
      upvotes: software.upvotes,
      message: isUpvoted ? 'Upvoted software!' : 'Upvote removed.',
    });
  } catch (error) {
    console.error('[Upvote API Error]:', error);
    return NextResponse.json({ error: 'Failed to upvote software.' }, { status: 500 });
  }
}
