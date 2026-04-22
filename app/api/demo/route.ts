import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

const SESSION_COOKIE = 'kid_session'

export async function GET() {
  const secret = process.env.KID_SESSION_SECRET || 'demo-secret-key-32-chars-minimum!!'
  const encoded = new TextEncoder().encode(secret)

  const token = await new SignJWT({
    kidId: 'demo-kid-001',
    parentId: 'demo-parent-001',
    familyCode: 'DEMO',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .setIssuedAt()
    .sign(encoded)

  const res = NextResponse.redirect(
    new URL('/home', process.env.NEXT_PUBLIC_APP_URL || 'https://iwantwhatiwant.vercel.app')
  )

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60,
    path: '/',
  })

  return res
}
