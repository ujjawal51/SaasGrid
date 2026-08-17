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
 * Send password reset email with secure token link.
 */
export async function sendResetEmail({ toEmail, toName, resetUrl }) {
  if (!toEmail) return;

  const displayName = toName || 'User';
  const subjectLine = `🔑 SaaTerra Password Reset Link`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030e1a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;">
    <tr><td style="padding:0 16px;">

      <!-- Header -->
      <div style="text-align:center;padding:28px 20px 20px;background:linear-gradient(135deg,#0c1e35,#0a2540);border-radius:16px 16px 0 0;border:1px solid #1e3a5f;border-bottom:none;">
        <p style="color:#00b4d8;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 6px;">SaaTerra — Password Security</p>
        <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;">
          🔑 Reset Your Password
        </h1>
      </div>

      <!-- Body -->
      <div style="background:#071525;border:1px solid #1e3a5f;border-top:none;border-bottom:none;padding:24px 24px 20px;">
        <p style="color:#cbd5e1;font-size:14px;margin:0 0 12px;">Hello <strong style="color:#fff;">${displayName}</strong>,</p>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 24px;">
          We received a request to reset your SaaTerra account password. Click the button below to choose a new password. This link is valid for <strong>1 Hour</strong>.
        </p>

        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(90deg,#0ea5e9,#38bdf8);color:#fff;font-size:14px;font-weight:800;padding:12px 32px;border-radius:12px;text-decoration:none;box-shadow:0 4px 14px rgba(14,165,233,0.4);">
            Reset Password Now →
          </a>
        </div>

        <p style="color:#64748b;font-size:11px;line-height:1.5;margin:20px 0 0;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#040f1c;border:1px solid #1e3a5f;border-top:none;border-radius:0 0 16px 16px;padding:16px 24px;text-align:center;">
        <p style="color:#334155;font-size:11px;margin:0;">
          SaaTerra · India's #1 SaaS Discovery Platform<br>
          Need help? Contact support@saaterra.in
        </p>
      </div>

    </td></tr>
  </table>
</body>
</html>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SaaTerra Security 🔑" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subjectLine,
      html,
    });
    console.log(`[sendResetEmail] ✅ Reset email sent to ${toEmail}`);
  } catch (err) {
    console.error('[sendResetEmail] ❌ Email send failed:', err.message);
  }
}
