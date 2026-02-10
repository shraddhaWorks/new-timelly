import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractSubdomain } from "@/lib/subdomain";

const IGNORE_PATHS = ["/api/", "/_next/", "/favicon", "/static"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API, static assets, Next.js internals
  if (IGNORE_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? "";
  const subdomain = extractSubdomain(host);

  // No subdomain: redirect to default subdomain (first school)
  const defaultSubdomain = process.env.NEXT_PUBLIC_DEFAULT_SUBDOMAIN;
  if (!subdomain && defaultSubdomain) {
    const redirectUrl = new URL(request.url);
    const protocol = request.headers.get("x-forwarded-proto") ?? redirectUrl.protocol.replace(":", "");
    redirectUrl.host = `${defaultSubdomain}.${host}`;
    redirectUrl.protocol = protocol;
    return NextResponse.redirect(redirectUrl);
  }

  // Pass subdomain to downstream via header (for server components / API)
  const requestHeaders = new Headers(request.headers);
  if (subdomain) {
    requestHeaders.set("x-school-subdomain", subdomain);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
