import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isKidRoute = (pathname: string) =>
  ['/home', '/learn', '/games', '/shop', '/profile'].some((p) => pathname.startsWith(p))

const isParentRoute = (pathname: string) => pathname.startsWith('/dashboard')

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // If Clerk keys are present, use Clerk middleware for parent routes
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && isParentRoute(pathname)) {
    const { clerkMiddleware } = await import('@clerk/nextjs/server')
    return clerkMiddleware()(req, {} as never)
  }

  // Kid route guard — cookie-based session
  if (isKidRoute(pathname)) {
    const kidSession = req.cookies.get('kid_session')
    if (!kidSession) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jld|ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|eot)$).*)',
    '/(api|trpc)(.*)',
  ],
}
