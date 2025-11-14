import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware - Request Pathname:", pathname);
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/api/login', '/api/refresh', '/api/introspect'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Allow access to static files and public routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/favicon.ico') ||
    isPublicRoute
  ) {
    return NextResponse.next();
  }
  
  // Check for access token cookie
  const accessToken = request.cookies.get('access_token');
  const tokenExpiry = request.cookies.get('token_expiry');
  
  // If no token or token is expired, redirect to login
  if (!accessToken || !accessToken.value) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check token expiry
  if (tokenExpiry && Date.now() >= parseInt(tokenExpiry.value)) {
    // Token is expired - clear cookies and redirect/return 401
    const response = pathname.startsWith('/api/') 
      ? NextResponse.json({ error: 'Token expired' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));
      
    // Clear expired cookies
    response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('token_expiry', '', { maxAge: 0, path: '/' });
    response.cookies.set('user_info', '', { maxAge: 0, path: '/' });
    
    return response;
  }
  
  // Check admin routes
  if (pathname.startsWith('/admin')) {
    const userInfo = request.cookies.get('user_info');
    
    if (userInfo?.value) {
      try {
        const user = JSON.parse(userInfo.value);
        const roles = user.resource_access?.['capstone-3']?.roles || [];
        console.log('User roles in middleware:', roles);
        if (!roles.includes('approver')) {
          return pathname.startsWith('/api/') 
            ? NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
            : NextResponse.redirect(new URL('/', request.url));
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    if (pathname.startsWith('/user')) {
      const userInfo = request.cookies.get('user_info');
      
      if (userInfo?.value) {
        try {
          const user = JSON.parse(userInfo.value);
          const roles = user.resource_access?.['capstone-3']?.roles || [];
          console.log('User roles in middleware:', roles);
          if (!roles.includes('user')) {
            return pathname.startsWith('/api/') 
              ? NextResponse.json({ error: 'Forbidden - User access required' }, { status: 403 })
              : NextResponse.redirect(new URL('/', request.url));
          }
        } catch (error) {
          console.error('Error parsing user info:', error);
          return NextResponse.redirect(new URL('/login', request.url));
        }
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};