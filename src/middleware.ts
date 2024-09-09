import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  if (token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === '/'
    )) {
    return NextResponse.redirect(new URL(`/${token.role}/dashboard`, request.url));
    // return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to the sign-in page when accessing any dashboard
  if (!token && (url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/teacher') ||
    url.pathname.startsWith('/student'))) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Authorization based on user role
  if (token) {
    const userRole = token.role;

    if (url.pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL("/403", request.url));
    }

    if (url.pathname.startsWith('/teacher') && userRole !== 'teacher') {
      return NextResponse.redirect(new URL("/403", request.url));
    }

    if (url.pathname.startsWith('/student') && userRole !== 'student') {
      return NextResponse.redirect(new URL("/403", request.url));
    }
  }
}

// Matcher configuration for middleware
export const config = {
  matcher: [
    "/sign-in",
    "/sign-up",
    "/verify",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*"
  ],
};