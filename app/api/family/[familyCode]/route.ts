import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ familyCode: string }> }
) {
  const { familyCode } = await params

  const parent = await prisma.parent.findUnique({
    where: { familyCode },
    include: {
      kids: {
        select: { id: true, name: true, avatarConfig: true, ageTier: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!parent) {
    return NextResponse.json({ error: 'Family not found' }, { status: 404 })
  }

  return NextResponse.json({ kids: parent.kids })
}
