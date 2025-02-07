// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// // Add routes that require authentication
// const protectedRoutes = ["/dashboard"];
// const authRoutes = ["/login"];

// export function middleware(request: NextRequest) {
//   const hasSession = request.cookies.has("session");
//   const isProtectedRoute = protectedRoutes.some((route) =>
//     request.nextUrl.pathname.startsWith(route),
//   );
//   const isAuthRoute = authRoutes.some((route) =>
//     request.nextUrl.pathname.startsWith(route),
//   );

//   // Redirect to login if accessing protected route without session
//   if (isProtectedRoute && !hasSession) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   // Redirect to dashboard if accessing auth routes with active session
//   if (isAuthRoute && hasSession) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [...protectedRoutes, ...authRoutes],
// };
