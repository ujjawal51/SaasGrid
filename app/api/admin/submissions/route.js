import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Submission from '@/models/Submission';
import Software from '@/models/Software';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { sendSubmissionEmail } from '@/lib/sendSubmissionEmail';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const submissions = await Submission.find(filter).sort({ createdAt: -1 }).lean();
    const pendingCount = await Submission.countDocuments({ status: 'pending' });

    return NextResponse.json({ ok: true, submissions, pendingCount });
  } catch (error) {
    console.error('[Admin Submissions API GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { _id, status, consentStatus, consentNotes } = body;

    if (!_id) {
      return NextResponse.json({ ok: false, error: '_id is required.' }, { status: 400 });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (consentStatus) updateFields.consentStatus = consentStatus;
    if (consentNotes !== undefined) updateFields.consentNotes = consentNotes;

    const submission = await Submission.findByIdAndUpdate(_id, { $set: updateFields }, { new: true }).lean();

    if (submission && (status === 'approved' || status === 'rejected')) {
      const slug = submission.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (status === 'approved') {
        await Software.findOneAndUpdate(
          { slug },
          {
            $set: {
              name: submission.name,
              slug,
              tagline: submission.tagline,
              description: submission.description,
              categorySlug: submission.categorySlug,
              pricingType: submission.pricingType,
              startingPrice: submission.startingPrice,
              billingCycle: submission.billingCycle,
              affiliateLink: submission.affiliateLink,
              logo: submission.logo,
              pros: submission.pros,
              cons: submission.cons,
            },
          },
          { upsert: true, new: true }
        );
      } else if (status === 'rejected') {
        // If rejected, unpublish from Software collection if previously created
        await Software.findOneAndDelete({ slug });
      }

      // ─── DUAL NOTIFICATION: In-App + Email to Vendor ─────────────────────
      const targetEmail = (submission.userEmail || submission.submitterEmail || '').toLowerCase().trim();
      let targetUserId = submission.userId;
      if (!targetUserId && targetEmail) {
        const u = await User.findOne({ email: targetEmail });
        if (u) targetUserId = u._id;
      }

      // 1. In-App Notification
      if (targetUserId) {
        const isAppr = status === 'approved';
        await Notification.create({
          userId:    targetUserId,
          userEmail: targetEmail,
          type:      isAppr ? 'submission_approved' : 'submission_rejected',
          title:     isAppr ? '🚀 Software Approved & Published!' : '❌ Submission Status Update',
          message:   isAppr
            ? `Congratulations! Your SaaS product "${submission.name}" has been approved and is now live on SaaTerra directory! 🎉`
            : `Your software submission for "${submission.name}" was not approved. ${consentNotes ? `Note: ${consentNotes}` : 'Please review submission guidelines and resubmit.'}`,
          link:      isAppr ? `/software/${slug}` : null,
          icon:      isAppr ? '🚀' : '❌',
          meta: {
            submissionId: submission._id,
            softwareName: submission.name,
            slug:         slug,
            status:       status,
          },
          isRead: false,
        });
      }

      // 2. Email Notification to Vendor
      if (targetEmail) {
        await sendSubmissionEmail({
          toEmail:      targetEmail,
          toName:       submission.submitterName,
          softwareName: submission.name,
          status:       status,
          adminNote:    consentNotes || '',
          softwareSlug: slug,
        });
      }
      // ─────────────────────────────────────────────────────────────────────
    }

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: `SUBMISSION_${status.toUpperCase()}`,
      target: submission?.name || _id,
      details: `Vendor submission ${status}`,
      req: request,
    });

    return NextResponse.json({ ok: true, submission });
  } catch (error) {
    console.error('[Admin Submissions API PATCH Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'ID is required.' }, { status: 400 });
    }

    const deleted = await Submission.findByIdAndDelete(id);

    if (deleted?.name) {
      const slug = deleted.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      await Software.findOneAndDelete({ slug });
    }

    await logAuditAction({
      adminEmail: authCheck.user.email,
      action: 'SUBMISSION_DELETED',
      target: id,
      details: `Deleted submission for ${deleted?.name || id}`,
      req: request,
    });

    return NextResponse.json({ ok: true, message: 'Submission deleted successfully.' });
  } catch (error) {
    console.error('[Admin Submissions API DELETE Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
