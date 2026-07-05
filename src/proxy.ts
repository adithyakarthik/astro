import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { PORTAL_SESSION_COOKIE_NAME } from "@/lib/auth/portal-session";

// Lightweight cookie-presence check only — this just keeps signed-out users
// off protected pages at the edge. The real check (session actually valid,
// not expired, correct user/module) happens in getCurrentUser() /
// getCurrentPortalClient() inside each page and server action, per Next.js's
// own guidance that Proxy alone isn't a substitute for per-route
// authorization.
//
// /portal/* is a completely separate auth surface (clients, not
// astrologers) with its own session cookie, so it's checked independently
// of the astrologer session used for everything else.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/portal")) {
    if (pathname === "/portal/login" || pathname.startsWith("/portal/login/")) {
      return NextResponse.next();
    }
    const hasPortalSession = request.cookies.has(PORTAL_SESSION_COOKIE_NAME);
    if (!hasPortalSession) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
