import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isParentRoute = createRouteMatcher(['/dashboard(.*)'])
const isKidRoute = createRouteMatcher(['/home(.*)', '/learn(.*)', '/games(.*)', '/shop(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isParentRoute(req)) {
    await auth.protect()
  }

  if (isKidRoute(req)) {
    const kidSession = req.cookies.get('kid_session')
    if (!kidSession) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jld|ico|png|svg|jpg|jpeg|gif|webp|woff2?|ttf|eot)$).*)',
    '/(api|trpc)(.*)',
  ],
}
