import { NextRequest, NextResponse } from 'next/server';
import { PROTECTED_ROUTES } from '@/constants/routes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is the error page with an error param
  if (pathname === '/error') {
    // Let the error page handle its own logic
    return NextResponse.next();
  }
  
  // Check if the user is logged in via cookie
  const isAuthenticated = request.cookies.has('next-auth.session-token') || 
                         request.cookies.has('__Secure-next-auth.session-token');

  // Check if the requested path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // If protected route and not authenticated, redirect to login page
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Continue with the request
  return NextResponse.next();
}