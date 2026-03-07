import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import siteSettings from "./config/site-settings.json";

const protectedPrefixes = [
  "/editeur",
  "/admin",
  "/master",
  "/indices",
  "/api/file",
  "/api/save-file",
];

const alwaysAllowedPrefixes = [
  "/_next",
  "/api/auth",
  "/favicon.ico",
  "/logo-carre_bicephale_rvb.png",
  "/robots.txt",
  "/sitemap.xml",
];

const isAlwaysAllowedPath = (pathname: string) => {
  if (pathname === "/") {
    return false;
  }

  if (pathname.includes(".")) {
    return true;
  }

  return alwaysAllowedPrefixes.some((prefix) => pathname.startsWith(prefix));
};

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

    if (siteSettings.maintenanceMode && !isAlwaysAllowedPath(pathname)) {
      const isAllowedDuringMaintenance = siteSettings.maintenanceAllowedPagePrefixes.some(
        (prefix) => pathname.startsWith(prefix)
      );
      const isMaintenanceHome = pathname === siteSettings.maintenanceHomePageRoute;

      if (!isAllowedDuringMaintenance && !isMaintenanceHome) {
        return NextResponse.redirect(new URL(siteSettings.maintenanceHomePageRoute, request.url));
      }
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
