import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { ageToTier } from '@/types'

const CreateKidSchema = z.object({
  name: z.string().min(2).max(20),
  age: z.number().int().min(4).max(12),
  pin: z.string().length(4).regex(/^\d{4}$/),
  avatarConfig: z.object({
    baseColor: z.string(),
    eyeType: z.enum(['happy', 'cool', 'sleepy', 'excited']),
    accessory: z.enum(['hat', 'glasses', 'bow', 'crown']).nullable().optional(),
    pet: z.enum(['cat', 'dog', 'dragon', 'unicorn', 'robot']).nullable().optional(),
  }),
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, age, pin, avatarConfig } = CreateKidSchema.parse(body)

    const parent = await prisma.parent.findUnique({ where: { clerkId: userId } })
    if (!parent) return NextResponse.json({ error: 'Parent not found' }, { status: 404 })

    const hashedPin = await bcrypt.hash(pin, 10)
    const ageTier = ageToTier(age)

    const kid = await prisma.kid.create({
      data: {
        parentId: parent.id,
        name: name.trim(),
        pin: hashedPin,
        ageTier,
        avatarConfig: avatarConfig as object,
      },
    })

    return NextResponse.json({ kid: { id: kid.id, name: kid.name } }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: err.errors }, { status: 400 })
    }
    console.error('[kids/create]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
