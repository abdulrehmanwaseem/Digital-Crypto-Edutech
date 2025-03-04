import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verify } from 'jsonwebtoken';
import { Role } from '@prisma/client';

// Define protected routes and their required roles
const PROTECTED_ROUTES: Record<string, Role[]> = {
  '/admin': [Role.ADMIN],
  '/dashboard': [Role.USER, Role.ADMIN],
  '/api/admin': [Role.ADMIN],
  '/api/courses/manage': [Role.ADMIN]
};

interface JWTPayload {
  role: Role;
  [key: string]: any;
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;
  
  // Check if path is protected
  const isProtected = Object.keys(PROTECTED_ROUTES).some(route => 
    pathname.startsWith(route)
  );

  // Allow public access to auth routes
  if (pathname.startsWith("/auth")) {
    if (token) {
      // If user is already logged in, redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      const decoded = verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
      
      // Check if user has required role for this route
      const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([route]) => 
        pathname.startsWith(route)
      )?.[1];

      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
    '/api/admin/:path*',
    '/api/courses/manage/:path*'
  ],
};
