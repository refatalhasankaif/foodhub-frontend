// proxy.ts  (root or src/)
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const Roles = {
  ADMIN: "ADMIN",
  PROVIDER: "PROVIDER",
  CUSTOMER: "CUSTOMER",
} as const;

type Role = (typeof Roles)[keyof typeof Roles];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Forward the cookies from the incoming request to your backend
  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  const user = session?.user;
  const isAuthenticated = !!session && !!user;
  const userRole = user?.role as Role | undefined;

  // 1. Redirect logged-in users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isAuthenticated) {
      let redirectTo = "/";
      if (userRole === Roles.ADMIN) redirectTo = "/admin/dashboard";
      else if (userRole === Roles.PROVIDER) redirectTo = "/provider/dashboard";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // 2. Unauthenticated → protect private routes
  if (!isAuthenticated) {
    const protectedPrefixes = [
      "/cart",
      "/checkout",
      "/orders",
      "/profile",
      "/provider",
      "/admin",
      "/dashboard",
    ];

    const isProtected = protectedPrefixes.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Authenticated → role-based access control
  if (userRole === Roles.CUSTOMER) {
    const forbidden = ["/provider", "/admin", "/dashboard"];
    if (forbidden.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (userRole === Roles.PROVIDER) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/provider/dashboard", request.url));
    }
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL("/provider/dashboard", request.url));
    }
  }

  if (userRole === Roles.ADMIN) {
    if (pathname === "/dashboard" || pathname === "/dashboard/") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (
      pathname.startsWith("/provider") ||
      pathname.startsWith("/dashboard/provider")
    ) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/cart",
    "/checkout",
    "/orders/:path*",
    "/profile",
    "/provider/:path*",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};