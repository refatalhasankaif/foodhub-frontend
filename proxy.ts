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

  const cookieHeader = request.headers.get("cookie");
  const session = await getSession(cookieHeader);

  const user = session?.user;
  const isAuthenticated = !!session && !!user;
  const userRole = user?.role as Role | undefined;


  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isAuthenticated) {
      let redirectTo = "/";
      if (userRole === Roles.ADMIN)    redirectTo = "/admin";
      if (userRole === Roles.PROVIDER) redirectTo = "/provider";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

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

    if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname === "/") {
    if (userRole === Roles.ADMIN)    return NextResponse.redirect(new URL("/admin", request.url));
    if (userRole === Roles.PROVIDER) return NextResponse.redirect(new URL("/provider", request.url));
  }

  if (userRole === Roles.CUSTOMER) {
    const forbidden = ["/provider", "/admin", "/dashboard"];
    if (forbidden.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (userRole === Roles.PROVIDER) {
    if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/provider", request.url));
    }
  }

  if (userRole === Roles.ADMIN) {
    if (pathname.startsWith("/provider") || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",       
    "/login",
    "/register",
    "/cart",
    "/checkout",
    "/orders/:path*",
    "/profile",
    "/provider",
    "/provider/:path*",
    "/admin",
    "/admin/:path*",
    "/dashboard/:path*",
  ],
};