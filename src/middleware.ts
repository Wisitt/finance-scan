import { NextRequest, NextResponse } from 'next/server';
import { PROTECTED_ROUTES, APP_ROUTES, PUBLIC_ROUTES } from '@/constants/routes';

/**
 * Middleware to protect routes that require authentication
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the user is logged in via cookie
  const isAuthenticated = request.cookies.has('next-auth.session-token') || 
                         request.cookies.has('__Secure-next-auth.session-token');

  // Check if the requested path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // If protected route and not authenticated, redirect to home page
  if (isProtectedRoute && !isAuthenticated) {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Continue with the request
  return NextResponse.next();
}

/**
 * Configure which paths should be processed by this middleware
 */
export const config = {
  matcher: [
    // All routes except for API, _next, static files, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 