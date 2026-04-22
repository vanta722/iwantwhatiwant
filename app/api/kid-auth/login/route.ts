import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createKidSession, setKidSessionCookie } from '@/lib/kid-session'
import { updateStreak } from '@/lib/tokens'
import { z } from 'zod'

const LoginSchema = z.object({
  kidId: z.string().min(1),
  pin: z.string().length(4).regex(/^\d{4}$/),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { kidId, pin } = LoginSchema.parse(body)

    const kid = await prisma.kid.findUnique({
      where: { id: kidId },
      include: { parent: { select: { id: true, familyCode: true } } },
    })

    if (!kid) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(pin, kid.pin)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const token = await createKidSession({
      kidId: kid.id,
      parentId: kid.parentId,
      familyCode: kid.parent.familyCode,
    })

    const response = NextResponse.json({ ok: true })

    response.cookies.set('kid_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    // Update streak in background (fire-and-forget)
    updateStreak(kid.id).catch(() => {})

    return response
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('[kid-auth/login]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
