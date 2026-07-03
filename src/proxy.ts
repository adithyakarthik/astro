import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Lightweight cookie-presence check only — this just keeps signed-out users
// off protected pages at the edge. The real check (session actually valid,
// not expired, correct user/module) happens in getCurrentUser() inside each
// page and server action, per Next.js's own guidance that Proxy alone isn't
// a substitute for per-route authorization.
export function proxy(request: NextRequest) {
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
