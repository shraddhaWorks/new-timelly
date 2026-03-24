import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const { pathname } = request.nextUrl;

  if (
    request.method === "GET" &&
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth/")
  ) {
    response.headers.set(
      "Cache-Control",
      "private, max-age=60, stale-while-revalidate=300"
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
