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
 * Send voucher / cashback approval email to user.
 *
 * @param {object} opts
 * @param {string} opts.toEmail       - User ka email address
 * @param {string} opts.toName        - User ka naam
 * @param {string} opts.softwareName  - Jis software ka cashback approve hua
 * @param {string} opts.voucherCode   - Voucher code (empty string for UPI payouts)
 * @param {string} opts.payoutType    - 'voucher' | 'upi'
 * @param {number} opts.cashbackAmount - Amount in INR
 * @param {string} opts.adminNote     - Optional admin message
 */
export async function sendVoucherEmail({
  toEmail,
  toName,
  softwareName,
  voucherCode = '',
  payoutType = 'upi',
  cashbackAmount = 0,
  adminNote = '',
}) {
  if (!toEmail) {
    console.warn('[sendVoucherEmail] No recipient email — skipping.');
    return;
  }

  const isVoucher = payoutType === 'voucher' && voucherCode;
  const displayName = toName || 'Valued User';
  const amountStr = cashbackAmount > 0 ? `₹${cashbackAmount}` : 'Cashback';

  const subjectLine = isVoucher
    ? `🎁 Instant Reward! ${amountStr} Amazon Voucher Delivered — SaaTerra`
    : `💸 Paisa Transferred! ${amountStr} Cashback Credited to Your Account — SaaTerra`;

  const voucherSection = isVoucher
    ? `
      <div style="background:#0f2744;border:2px dashed #00b4d8;border-radius:14px;padding:24px 20px;text-align:center;margin:24px 0;">
        <p style="color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 8px;">Amazon Gift Voucher Code</p>
        <p style="color:#00e5ff;font-size:28px;font-weight:900;letter-spacing:0.18em;font-family:monospace;margin:0 0 12px;">${voucherCode}</p>
        <p style="color:#64748b;font-size:11px;margin:0;">Copy this code &amp; redeem on Amazon Pay</p>
      </div>
      <div style="background:#0a1f35;border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="color:#94a3b8;font-size:12px;font-weight:700;margin:0 0 10px;">Kaise Redeem Karein:</p>
        <p style="color:#cbd5e1;font-size:13px;margin:4px 0;">1️⃣ Amazon App kholo</p>
        <p style="color:#cbd5e1;font-size:13px;margin:4px 0;">2️⃣ Amazon Pay → <strong>Add Gift Card</strong> me jaao</p>
        <p style="color:#cbd5e1;font-size:13px;margin:4px 0;">3️⃣ Code paste karo → ${amountStr} turant add ho jayega</p>
      </div>`
    : `
      <div style="background:linear-gradient(135deg,#062817,#0f3822);border:1px solid #10b98155;border-radius:16px;padding:24px 20px;text-align:center;margin:24px 0;">
        <div style="display:inline-block;background:#10b98125;border:1px solid #10b98160;color:#34d399;font-size:11px;font-weight:800;padding:4px 14px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px;">
          ⚡ Payout Transferred &amp; Credited
        </div>
        <p style="color:#4ade80;font-size:32px;font-weight:900;margin:4px 0;letter-spacing:-0.02em;">${amountStr}</p>
        <p style="color:#e2e8f0;font-size:14px;font-weight:700;margin:6px 0 2px;">Aapke UPI / Bank Account me bhej diya gaya hai! 🚀</p>
        <p style="color:#94a3b8;font-size:12px;margin:4px 0 0;">Kripya apna UPI app ya bank balance check karein.</p>
      </div>`;

  const adminNoteSection = adminNote
    ? `<div style="border-left:3px solid #0ea5e9;padding:10px 16px;margin:16px 0;background:#0a1f35;border-radius:0 8px 8px 0;">
        <p style="color:#94a3b8;font-size:11px;font-weight:700;margin:0 0 4px;">Admin Note:</p>
        <p style="color:#cbd5e1;font-size:13px;margin:0;">${adminNote}</p>
       </div>`
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030e1a;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;">
    <tr><td style="padding:0 16px;">

      <!-- Header -->
      <div style="text-align:center;padding:28px 20px 20px;background:linear-gradient(135deg,#0c1e35,#0a2540);border-radius:16px 16px 0 0;border:1px solid #1e3a5f;border-bottom:none;">
        <p style="color:#00b4d8;font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 6px;">SaaTerra — Instant Cashback Payout</p>
        <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0;">
          ${isVoucher ? '🎁 Voucher Deliver Ho Chuka Hai!' : '💸 Cashback Successfully Transferred!'}
        </h1>
        <p style="color:#94a3b8;font-size:13px;margin:8px 0 0;">
          ${softwareName} ke liye ${amountStr} ${isVoucher ? 'Amazon Gift Voucher deliver ho chuka hai' : 'aapke account mein bhej diya gaya hai'}.
        </p>
      </div>

      <!-- Body -->
      <div style="background:#071525;border:1px solid #1e3a5f;border-top:none;border-bottom:none;padding:24px 24px 8px;">
        <p style="color:#cbd5e1;font-size:14px;margin:0 0 4px;">Namaste, <strong style="color:#fff;">${displayName}</strong>! 🎉</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 20px;">
          Aapka <strong style="color:#fff;">${softwareName}</strong> cashback claim verify ho chuka hai aur payout transfer complete kar diya gaya hai.
        </p>

        ${voucherSection}
        ${adminNoteSection}
      </div>

      <!-- Footer -->
      <div style="background:#040f1c;border:1px solid #1e3a5f;border-top:none;border-radius:0 0 16px 16px;padding:16px 24px;text-align:center;">
        <a href="https://saaterra.in/cashback" style="display:inline-block;background:linear-gradient(90deg,#0ea5e9,#38bdf8);color:#fff;font-size:13px;font-weight:800;padding:10px 28px;border-radius:10px;text-decoration:none;margin-bottom:16px;">
          SaaTerra Profile Dekho →
        </a>
        <p style="color:#334155;font-size:11px;margin:0;">
          SaaTerra · India's #1 SaaS Comparison Platform<br>
          Agar koi samasya ho: support@saaterra.in
        </p>
      </div>

    </td></tr>
  </table>
</body>
</html>`;

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"SaaTerra 🎁" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subjectLine,
      html,
    });
    console.log(`[sendVoucherEmail] ✅ Email sent to ${toEmail}`);
  } catch (err) {
    console.error('[sendVoucherEmail] ❌ Email send failed:', err.message);
    // Non-blocking — don't throw, just log
  }
}
