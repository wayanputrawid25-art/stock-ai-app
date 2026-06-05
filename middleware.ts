import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/admin", "/dashboard", "/api/export", "/api/ocr"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const session = request.cookies.get("fa4d_session");
  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/export/:path*", "/api/ocr/:path*"]
};
