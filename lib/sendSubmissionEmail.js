import nodemailer from 'nodemailer';

function createTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

/**
 * Send submission status email to vendor (Approved / Rejected)
 */
export async function sendSubmissionEmail({
  toEmail,
  toName,
  softwareName,
  status, // 'approved' | 'rejected'
  adminNote = '',
  softwareSlug = '',
}) {
  if (!toEmail) return;

  const displayName = toName || 'Founder / Partner';
  const isApproved = status === 'approved';
  const liveUrl = `https://saaterra.in/software/${softwareSlug}`;

  const subjectLine = isApproved
    ? `🚀 Congratulations! ${softwareName} is now LIVE on SaaTerra`
    : `❌ Update regarding your software submission: ${softwareName} — SaaTerra`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030e1a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;">
    <tr><td style="padding:0 16px;">

      <!-- Header -->
      <div style="text-align:center;padding:28px 20px 20px;background:linear-gradient(135deg,#0c1e35,#0a2540);border-radius:16px 16px 0 0;border:1px solid #1e3a5f;border-bottom:none;">
        <p style="color:#00b4d8;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 6px;">SaaTerra — Software Moderation</p>
        <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;">
          ${isApproved ? '🚀 Software Approved & Published!' : '❌ Submission Review Update'}
        </h1>
        <p style="color:#94a3b8;font-size:13px;margin:8px 0 0;">
          Status update for <strong style="color:#fff;">${softwareName}</strong>
        </p>
      </div>

      <!-- Body -->
      <div style="background:#071525;border:1px solid #1e3a5f;border-top:none;border-bottom:none;padding:24px 24px 20px;">
        <p style="color:#cbd5e1;font-size:14px;margin:0 0 12px;">Hello <strong style="color:#fff;">${displayName}</strong>, 👋</p>

        ${
          isApproved
            ? `
          <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 20px;">
            Great news! Your software submission for <strong style="color:#fff;">${softwareName}</strong> has been verified and approved by our team. It is now published live on SaaTerra's discovery directory.
          </p>

          <div style="background:linear-gradient(135deg,#062817,#0f3822);border:1px solid #10b98155;border-radius:16px;padding:20px;text-align:center;margin:24px 0;">
            <div style="display:inline-block;background:#10b98125;border:1px solid #10b98160;color:#34d399;font-size:11px;font-weight:800;padding:4px 14px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">
              ⚡ LIVE &amp; SEARCHABLE
            </div>
            <p style="color:#4ade80;font-size:20px;font-weight:900;margin:4px 0;">${softwareName}</p>
            <p style="color:#94a3b8;font-size:12px;margin:4px 0 16px;">Users across India can now discover, review, and compare your tool.</p>
            <a href="${liveUrl}" style="display:inline-block;background:linear-gradient(90deg,#0ea5e9,#38bdf8);color:#fff;font-size:13px;font-weight:800;padding:10px 24px;border-radius:10px;text-decoration:none;">
              View Live Listing →
            </a>
          </div>
          `
            : `
          <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 16px;">
            Thank you for submitting <strong style="color:#fff;">${softwareName}</strong> to SaaTerra. After reviewing the submission, our moderation team was unable to approve it at this time.
          </p>

          ${
            adminNote
              ? `<div style="border-left:3px solid #f43f5e;padding:10px 16px;margin:16px 0;background:#2d0b14;border-radius:0 8px 8px 0;">
                  <p style="color:#fda4af;font-size:11px;font-weight:700;margin:0 0 4px;">Moderation Note:</p>
                  <p style="color:#cbd5e1;font-size:13px;margin:0;">${adminNote}</p>
                 </div>`
              : ''
          }

          <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:16px 0 0;">
            You can make the required adjustments and submit again from your dashboard.
          </p>
          `
        }

      </div>

      <!-- Footer -->
      <div style="background:#040f1c;border:1px solid #1e3a5f;border-top:none;border-radius:0 0 16px 16px;padding:16px 24px;text-align:center;">
        <p style="color:#334155;font-size:11px;margin:0;">
          SaaTerra · India's #1 SaaS Discovery Platform<br>
          For any questions: support@saaterra.in
        </p>
      </div>

    </td></tr>
  </table>
</body>
</html>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SaaTerra Partner Team 🚀" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subjectLine,
      html,
    });
    console.log(`[sendSubmissionEmail] ✅ Email sent to ${toEmail}`);
  } catch (err) {
    console.error('[sendSubmissionEmail] ❌ Email send failed:', err.message);
  }
}
