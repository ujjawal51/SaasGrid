import { NextResponse } from 'next/server';

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired token
    }
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request) {
  const token = request.cookies.get('saaterra_token')?.value;
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  // Add Hardened Security Headers (Feature 5)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: Login required for admin API access.' },
        { status: 401 }
      );
    }
    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized: Admin role required for API access.' },
        { status: 403 }
      );
    }
  }

  // Protect Admin Page Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'login_required');
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwtPayload(token);
    if (!payload || payload.role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_admin_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Action-Specific Feature Routes (/profile, /submit, /write-review, /cashback)
  const isProtectedRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/submit') ||
    pathname.startsWith('/cashback') ||
    pathname.includes('/write-review');

  if (!token && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    loginUrl.searchParams.set('reason', 'auth_required');
    return NextResponse.redirect(loginUrl);
  }

  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
