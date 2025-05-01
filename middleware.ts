import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect the indices page and any API routes that should require authentication
  if (request.nextUrl.pathname === '/indices' && !token) {
    // Save the original URL to redirect back after login
    const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url));
  }

  // Protect the API routes that require authentication
  if (request.nextUrl.pathname.startsWith('/api/file') || 
      request.nextUrl.pathname.startsWith('/api/save-file')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Redirect to indices if already logged in and trying to access signin
  if (request.nextUrl.pathname === '/auth/signin' && token) {
    return NextResponse.redirect(new URL('/indices', request.url));
  }

  return NextResponse.next();
}

// Specify which paths should be processed by middleware
export const config = {
  matcher: [
    '/indices', 
    '/auth/signin', 
    '/api/file',
    '/api/save-file'
  ],
};