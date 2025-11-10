// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const protectedPrefixes = [
  "/editeur",
  "/admin",
  "/master",
  "/indices",
  "/api/file",
  "/api/save-file",
];

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl;

    if (pathname === "/reflexion") {
      return NextResponse.redirect(new URL("/Reflexion", request.url));
    }

    if (pathname === "/creation") {
      return NextResponse.redirect(new URL("/Creation", request.url));
    }

    if (pathname === "/irl") {
      return NextResponse.redirect(new URL("/IRL", request.url));
    }

    if (pathname === "/evenements") {
      return NextResponse.redirect(new URL("/IRL", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
          return Boolean(token);
        }

        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: ["/:path*"],
};

