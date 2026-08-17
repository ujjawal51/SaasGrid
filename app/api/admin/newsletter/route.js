import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { verifyAdminApi, logAuditAction } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Create Gmail transporter
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

// GET — return all users' emails and count
export async function GET(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let query = {};
    if (filter === 'users') query = { role: { $in: ['user', 'vendor'] } };
    if (filter === 'admins') query = { role: 'admin' };

    const users = await User.find(query).select('name email role').lean();

    return NextResponse.json({
      ok: true,
      count: users.length,
      users: users.map((u) => ({ name: u.name, email: u.email, role: u.role })),
    });
  } catch (error) {
    console.error('[Newsletter GET Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// POST — send email newsletter
export async function POST(request) {
  try {
    const authCheck = await verifyAdminApi(request);
    if (!authCheck.authorized) {
      return NextResponse.json({ ok: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { subject, htmlBody, recipientFilter } = body;

    if (!subject?.trim() || !htmlBody?.trim()) {
      return NextResponse.json({ ok: false, error: 'Subject and Email Body are required.' }, { status: 400 });
    }

    await dbConnect();

    let query = {};
    if (recipientFilter === 'users') query = { role: { $in: ['user', 'vendor'] } };
    if (recipientFilter === 'admins') query = { role: 'admin' };

    const users = await User.find(query).select('name email').lean();

    if (users.length === 0) {
      return NextResponse.json({ ok: false, error: 'No recipients found for the selected filter.' }, { status: 400 });
    }

    const transporter = createTransporter();
    await transporter.verify();

    const fromName = process.env.GMAIL_FROM_NAME || 'SaaTerra Platform';
    const fromEmail = process.env.GMAIL_USER?.trim();

    // Read logo file buffer safely
    const logoPath = path.join(process.cwd(), 'public', 'logo-trimmed.png');
    const hasLogo = fs.existsSync(logoPath);
    const logoBuffer = hasLogo ? fs.readFileSync(logoPath) : null;

    let sent = 0;
    let failed = 0;
    const failedEmails = [];

    const plainTextBody = htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    // Send emails one by one
    for (const user of users) {
      const personalizedHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin:0;padding:0;background:#0B192C;font-family:'Segoe UI',Arial,sans-serif;">
            <div style="max-width:600px;margin:20px auto;background:#0d1c2e;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
              
              <!-- Header with Official SaaTerra Embedded Logo -->
              <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 24px;text-align:center;border-bottom:2px solid #0ea5e9;">
                ${
                  hasLogo
                    ? `<img src="cid:saaterra-logo@saaterra.in" alt="SaaTerra Logo" style="height:52px;width:auto;max-width:220px;display:inline-block;margin-bottom:8px;border:0;outline:none;" />`
                    : `<h1 style="color:white;margin:0;font-size:24px;font-weight:900;">🚀 SaaTerra</h1>`
                }
                <p style="color:#0ea5e9;margin:6px 0 0;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">
                  India's #1 SaaS Discovery Platform
                </p>
              </div>

              <!-- Greeting -->
              <div style="padding:24px 24px 0;">
                <p style="color:#94a3b8;margin:0;font-size:14px;">
                  Hi <strong style="color:#e2e8f0;">${user.name || 'there'}</strong>,
                </p>
              </div>

              <!-- Body Content -->
              <div style="padding:16px 24px;color:#cbd5e1;font-size:14px;line-height:1.7;">
                ${htmlBody}
              </div>

              <!-- CTA Button -->
              <div style="padding:16px 24px 24px;text-align:center;">
                <a href="https://saaterra.com" 
                   style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:white;text-decoration:none;padding:12px 28px;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 12px rgba(14,165,233,0.3);">
                  Visit SaaTerra Platform →
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top:1px solid rgba(255,255,255,0.08);padding:16px 24px;text-align:center;background:#091422;">
                <p style="color:#475569;font-size:11px;margin:0;">
                  © 2026 SaaTerra · India's #1 SaaS Discovery Platform
                </p>
                <p style="color:#475569;font-size:11px;margin:4px 0 0;">
                  You are receiving this email because you registered on SaaTerra.
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      const attachments = hasLogo
        ? [
            {
              filename: 'logo-trimmed.png',
              content: logoBuffer,
              contentType: 'image/png',
              cid: 'saaterra-logo@saaterra.in',
              contentDisposition: 'inline',
            },
          ]
        : [];

      try {
        const info = await transporter.sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: user.email,
          subject,
          text: `Hi ${user.name || 'there'},\n\n${plainTextBody}\n\nVisit SaaTerra: https://saaterra.com`,
          html: personalizedHtml,
          attachments,
        });
        console.log(`[Newsletter Sent] ${user.email}:`, info.response);
        sent++;
      } catch (err) {
        console.error(`[Newsletter Failed] ${user.email}:`, err.message);
        failed++;
        failedEmails.push(user.email);
      }
    }

    await logAuditAction({
      adminEmail: authCheck.user?.email || 'admin@saaterra.in',
      action: 'NEWSLETTER_SENT',
      target: `${sent} recipients`,
      details: `Subject: "${subject}" | Sent: ${sent} | Failed: ${failed}`,
      req: request,
    });

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      total: users.length,
      failedEmails: failedEmails.slice(0, 10),
    });
  } catch (error) {
    console.error('[Newsletter POST Error]:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
