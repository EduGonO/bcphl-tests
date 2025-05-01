import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Protect the indices page
  if (request.nextUrl.pathname === '/indices' && !session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Redirect to indices if already logged in and trying to access signin
  if (request.nextUrl.pathname === '/auth/signin' && session) {
    return NextResponse.redirect(new URL('/indices', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/indices', '/auth/signin'],
};