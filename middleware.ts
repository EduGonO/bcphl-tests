// middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: ["/editeur", "/indices", "/api/file", "/api/save-file"],
}



/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // For debugging purposes - this will appear in server logs
  console.log(`Middleware check: Path=${request.nextUrl.pathname}, HasToken=${!!token}`);

  // Protect the indices page
  if (request.nextUrl.pathname === '/editeur') {
    if (!token) {
      // Save the original URL to redirect back after login
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
      const redirectUrl = new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redirect to indices if already logged in and trying to access signin
  if (request.nextUrl.pathname === '/auth/signin' && token) {
    return NextResponse.redirect(new URL('/editeur', request.url));
  }

  return NextResponse.next();
}

// Specify which paths should be processed by middleware
export const config = {
  matcher: ['/editeur', '/indices', '/auth/signin'],
};
*/