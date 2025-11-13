import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/api/login', '/api/logout'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Allow access to static files and public routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check for access token cookie
  const accessToken = request.cookies.get('access_token');
  const tokenExpiry = request.cookies.get('token_expiry');
  
  // If no token or token is expired, redirect to login
  if (!accessToken || (tokenExpiry && Date.now() >= parseInt(tokenExpiry.value))) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/login (login endpoint)
     * - api/logout (logout endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/login|api/logout|_next/static|_next/image|favicon.ico|public|login).*)',
  ],
};