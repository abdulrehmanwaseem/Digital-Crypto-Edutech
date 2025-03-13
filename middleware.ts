import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { authRoutes, publicRoutes, DEFAULT_LOGIN_REDIRECT } from "./routes";
import { Role } from "@prisma/client";

export default auth((req) => {
  const { nextUrl, auth } = req;
  const isLoggedIn = !!auth;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (nextUrl.pathname.startsWith('/images/')) {
    return NextResponse.next();
  }
  // API routes should be handled separately
  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next(); 
  }

  // Auth routes (login, register, error)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // Public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }


  // Protected routes
  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return Response.redirect(new URL(
      `/login?redirect=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  // Admin routes
  if (nextUrl.pathname.startsWith('/admin')) {
    if (auth?.user?.role !== Role.ADMIN) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

// Optionally configure Edge Runtime
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
