import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const userId = request.cookies.get("user")?.value;

  if (!token || !userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBaseUrl) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const res = await fetch(`${apiBaseUrl}/api/auth/${userId}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const data: { user?: { role?: string } } = await res.json();
    const role = String(data?.user?.role ?? "").toLowerCase();

    if (role !== "admin" && role !== "rh") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    // "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
