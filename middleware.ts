import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // protected sections
  const protectedPaths = [/^\/room(\/|$)/, /^\/rooms(\/|$)/, /^\/chat(\/|$)/];
  const isProtected = protectedPaths.some((re) => re.test(pathname));
  if (!isProtected) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const to = new URL(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`, origin);
    return NextResponse.redirect(to);
  }

  if (!(token as any).ageVerifiedAt) {
    const to = new URL(`/auth/age-restricted?callbackUrl=${encodeURIComponent(pathname)}`, origin);
    return NextResponse.redirect(to);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/room/:path*", "/rooms/:path*", "/chat/:path*"] };
