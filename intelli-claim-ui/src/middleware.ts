import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/Auth/AuthManager';

async function attemptTokenRefresh(
  request: NextRequest, 
  pathname: string, 
  authManager: AuthManager
): Promise<NextResponse | null> {
  const refreshToken = request.cookies.get('refresh_token');
  
  if (refreshToken?.value) {
    try {
      const response = pathname.startsWith('/api/') 
        ? NextResponse.json({}, { status: 200 })
        : NextResponse.next();
      
      await authManager.refreshToken(request, response);
      
      console.log('Token refreshed successfully in middleware');
      
      // If API request, return success response with updated cookies
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Token refreshed' }, { status: 200 });
      }
      
      // For page requests, continue with the refreshed tokens
      return response;
      
    } catch (error) {
      console.error('Token refresh failed in middleware:', error);
      return null; // Indicates refresh failed
    }
  }
  
  return null; // No refresh token available
}

export async function middleware(request: NextRequest) {
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
  
  // If no access token, check if we can refresh
  if (!accessToken || !accessToken.value) {
    const authManager = AuthManager.getInstance();
    const refreshResult = await attemptTokenRefresh(request, pathname, authManager);
    
    if (refreshResult) {
      return refreshResult; // Successfully refreshed
    }
    
    // No refresh token or refresh failed - redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Check token expiry
  if (tokenExpiry && Date.now() >= parseInt(tokenExpiry.value)) {
    // Token is expired - attempt refresh first
    const authManager = AuthManager.getInstance();
    const refreshResult = await attemptTokenRefresh(request, pathname, authManager);
    
    if (refreshResult) {
      return refreshResult; // Successfully refreshed
    }
    
    // No refresh token or refresh failed - clear cookies and redirect/return 401
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
  
  // Check role-based access
  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    const userInfo = request.cookies.get('user_info');
    
    if (!userInfo?.value) {
      // No user info available - this shouldn't happen since we have valid tokens
      console.error('No user info available despite valid tokens');
      return pathname.startsWith('/api/') 
        ? NextResponse.json({ error: 'Forbidden - User info not available' }, { status: 403 })
        : NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      const user = JSON.parse(userInfo.value);
      const roles = user.resource_access?.['capstone-3']?.roles || [];
      console.log('User roles in middleware:', roles);
      
      // Check admin access
      if (pathname.startsWith('/admin') && !roles.includes('approver')) {
        return pathname.startsWith('/api/') 
          ? NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
          : NextResponse.redirect(new URL('/', request.url));
      }
      
      // Check user access
      if (pathname.startsWith('/user') && !roles.includes('user')) {
        return pathname.startsWith('/api/') 
          ? NextResponse.json({ error: 'Forbidden - User access required' }, { status: 403 })
          : NextResponse.redirect(new URL('/', request.url));
      }
      
    } catch (error) {
      console.error('Error parsing user info:', error);
      return pathname.startsWith('/api/') 
        ? NextResponse.json({ error: 'Invalid user data' }, { status: 403 })
        : NextResponse.redirect(new URL('/login', request.url));
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