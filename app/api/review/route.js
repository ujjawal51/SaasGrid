

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Software from '@/models/Software';
import Review from '@/models/Review';
import { getAuthUser } from '@/lib/auth';

export async function POST(request) {
  try {
    
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in or signed up to submit a review.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { softwareSlug, userDesignation, rating, reviewTitle, feedbackPros, feedbackCons } = body;

    if (!softwareSlug || !rating || !reviewTitle || !feedbackPros || !feedbackCons) {
      return NextResponse.json(
        { error: 'All required fields (Rating, Title, Pros, Cons) must be filled.' },
        { status: 400 }
      );
    }

    await dbConnect();

    const software = await Software.findOne({ slug: softwareSlug });
    if (!software) {
      return NextResponse.json({ error: 'Software not found' }, { status: 404 });
    }

    // Check if user has already submitted a review for this software
    const existingReview = await Review.findOne({
      softwareId: software._id,
      userName: user.name,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this software.' },
        { status: 400 }
      );
    }

    const newReview = await Review.create({
      softwareId: software._id,
      userName: user.name,
      userDesignation: userDesignation?.trim() || null,
      rating: Number(rating),
      reviewTitle: reviewTitle.trim(),
      feedbackPros: feedbackPros.trim(),
      feedbackCons: feedbackCons.trim(),
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully! It will be published after quick admin verification.',
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API Review POST Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}
