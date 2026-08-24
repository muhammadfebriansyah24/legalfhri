import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromRequest, type Role } from '@/lib/session';

const PUBLIC_PATHS = ['/login', '/register', '/disclaimer'];

// path prefix -> role yang boleh akses
const PROTECTED: { prefix: string; roles: Role[] }[] = [
  { prefix: '/dashboard', roles: ['user'] },
  { prefix: '/consultations', roles: ['user'] },
  { prefix: '/inbox', roles: ['admin_legal'] },
  { prefix: '/case', roles: ['admin_legal'] },
  { prefix: '/history', roles: ['admin_legal'] },
  { prefix: '/grant-token', roles: ['digital_marketing', 'superadmin'] },
  { prefix: '/audit-log', roles: ['digital_marketing', 'superadmin'] },
  { prefix: '/packages', roles: ['superadmin'] },
  { prefix: '/settings', roles: ['superadmin'] },
  { prefix: '/users', roles: ['superadmin'] },
];

function homeFor(role: Role) {
  switch (role) {
    case 'user': return '/dashboard';
    case 'admin_legal': return '/inbox';
    case 'digital_marketing': return '/grant-token';
    case 'superadmin': return '/grant-token';
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    // Sudah login tapi buka /login atau /register -> lempar ke home masing-masing role
    if (session && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL(homeFor(session.role), req.url));
    }
    return NextResponse.next();
  }

  const match = PROTECTED.find((p) => pathname === p.prefix || pathname.startsWith(p.prefix + '/'));
  if (!match) return NextResponse.next();

  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (!match.roles.includes(session.role)) {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/consultations/:path*',
    '/inbox/:path*',
    '/case/:path*',
    '/history/:path*',
    '/grant-token/:path*',
    '/audit-log/:path*',
    '/packages/:path*',
    '/settings/:path*',
    '/users/:path*',
    '/login',
    '/register',
  ],
};
