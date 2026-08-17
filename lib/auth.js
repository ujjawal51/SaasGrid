import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from './dbConnect';
import AuditLog from '@/models/AuditLog';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!');
    }
    return 'saaterra_dev_only_jwt_secret_key_2026_do_not_use_in_prod';
  }
  return secret;
}

const COOKIE_NAME = 'saaterra_token';

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'user',
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret());
    return decoded;
  } catch {
    return null;
  }
}

export async function verifyAdminApi(request) {
  try {
    const user = await getAuthUser();
    if (user && user.role === 'admin') {
      return { authorized: true, user };
    }
    return { authorized: false, error: 'Unauthorized. Admin role required.', user: null };
  } catch (err) {
    return { authorized: false, error: 'Authentication check failed.', user: null };
  }
}

export async function logAuditAction({ adminEmail, action, target = '', details = '', req }) {
  try {
    await dbConnect();
    const ip = req?.headers?.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req?.headers?.get('user-agent') || '';

    await AuditLog.create({
      adminEmail: adminEmail || 'admin@saaterra.in',
      action,
      target,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details),
      ip: String(ip).split(',')[0].trim(),
      userAgent,
    });
  } catch (err) {
    console.error('[Audit Log Failed]:', err);
  }
}
