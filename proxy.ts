import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextAuthRequest } from "next-auth"

const PUBLIC_ROUTES = ["/login"]

export default auth(function middleware(req: NextAuthRequest) {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Allow NextAuth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from login
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Root redirect
  if (pathname === "/") {
    return session
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : NextResponse.redirect(new URL("/login", req.url))
  }

  // Require auth for all other routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
