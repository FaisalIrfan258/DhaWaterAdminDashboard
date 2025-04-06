import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('admin_token'); // Check for the authentication token

  // If the token is not present, redirect to the login page
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next(); // Allow the request to proceed
}

// Specify the paths that the middleware should apply to
export const config = {
  matcher: ['/dashboard/:path*', '/requests/:path*', '/users/:path*'], // Apply to all relevant routes
};
