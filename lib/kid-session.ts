import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { KidSessionPayload } from '@/types'

const SESSION_COOKIE = 'kid_session'
const SESSION_DURATION_HOURS = 8

function getSecret() {
  const secret = process.env.KID_SESSION_SECRET
  if (!secret) throw new Error('KID_SESSION_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function createKidSession(payload: KidSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_DURATION_HOURS}h`)
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyKidSession(token: string): Promise<KidSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as KidSessionPayload
  } catch {
    return null
  }
}

export async function getKidSession(): Promise<KidSessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyKidSession(token)
}

export async function setKidSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
    path: '/',
  })
}

export async function clearKidSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
