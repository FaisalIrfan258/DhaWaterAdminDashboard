import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow access to login page and public assets
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // For dashboard routes, we'll handle authentication on the client side
  // since we're using localStorage instead of cookies
  if (pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  return NextResponse.next(); // Allow the request to proceed
}

// Specify the paths that the middleware should apply to - protect all routes except login
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
