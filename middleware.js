// import { NextResponse } from "next/server"

// export function middleware(request) {
//   // Get the pathname
//   const path = request.nextUrl.pathname

//   // Define public paths that don't require authentication
//   const isPublicPath = path === "/login"

//   // Get the token from the cookies
//   const token = request.cookies.get("access_token")?.value || ""

//   // Redirect to login if accessing a protected route without a token
//   if (!isPublicPath && !token) {
//     return NextResponse.redirect(new URL("/login", request.url))
//   }

//   // Redirect to dashboard if accessing login with a valid token
//   if (isPublicPath && token) {
//     return NextResponse.redirect(new URL("/dashboard", request.url))
//   }

//   // Add CORS headers to all responses
//   const response = NextResponse.next()

//   response.headers.set("Access-Control-Allow-Origin", "http://localhost:3000")
//   response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
//   response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
//   response.headers.set("Access-Control-Allow-Credentials", "true")

//   return response
// }

// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// }

