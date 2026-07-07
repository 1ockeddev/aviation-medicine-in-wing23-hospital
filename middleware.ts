import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isAuthPage = pathname.startsWith('/login');
  const isProtectedPage = pathname.startsWith('/admin');

  // Redirect unauthenticated users to login page
  if (isProtectedPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect authenticated users away from login page to admin
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
};
