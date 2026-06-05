import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/admin", "/dashboard", "/api/export", "/api/ocr"];

function isValidSessionToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return false;
    }

    const [encoded] = parts;

    // Basic validation: check if it's valid base64url
    try {
      Buffer.from(encoded, "base64url").toString("utf8");
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("fa4d_session");

  if (!sessionCookie) {
    console.warn(`🚫 Protected route accessed without session: ${request.nextUrl.pathname}`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Validate session token format and structure
  if (!isValidSessionToken(sessionCookie.value)) {
    console.warn(`🚫 Invalid session token format detected at: ${request.nextUrl.pathname}`);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("fa4d_session");
    return response;
  }

  try {
    // Parse and validate session expiry at middleware level (basic check)
    const [encoded] = sessionCookie.value.split(".");
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));

    if (typeof payload.exp !== "number") {
      console.warn(`🚫 Invalid session payload at: ${request.nextUrl.pathname}`);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("fa4d_session");
      return response;
    }

    // Check if session is expired
    if (payload.exp < Date.now()) {
      console.debug(`Session expired at: ${request.nextUrl.pathname}`);
      const response = NextResponse.redirect(new URL("/login?error=session_expired", request.url));
      response.cookies.delete("fa4d_session");
      return response;
    }
  } catch (error) {
    console.error(
      `Middleware session parsing error at ${request.nextUrl.pathname}:`,
      error instanceof Error ? error.message : String(error)
    );
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("fa4d_session");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/export/:path*", "/api/ocr/:path*"]
};
