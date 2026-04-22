import { NextRequest, NextResponse } from 'next/server'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { spendTokens } from '@/lib/tokens'
import { z } from 'zod'

const PurchaseSchema = z.object({
  itemId: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getKidSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { itemId } = PurchaseSchema.parse(body)

    const [item, alreadyOwned] = await Promise.all([
      prisma.shopItem.findUnique({ where: { id: itemId, isActive: true } }),
      prisma.inventoryItem.findUnique({
        where: { kidId_itemId: { kidId: session.kidId, itemId } },
      }),
    ])

    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    if (alreadyOwned) return NextResponse.json({ error: 'Already owned' }, { status: 409 })
    if (item.isRealMoney) return NextResponse.json({ error: 'This item requires parent approval' }, { status: 403 })

    await spendTokens(session.kidId, item.tokenCost, `Purchased: ${item.name}`, itemId)

    await prisma.inventoryItem.create({
      data: { kidId: session.kidId, itemId },
    })

    const kid = await prisma.kid.findUnique({
      where: { id: session.kidId },
      select: { tokenBalance: true },
    })

    return NextResponse.json({ ok: true, newBalance: kid?.tokenBalance ?? 0 })
  } catch (err) {
    if (err instanceof Error && err.message === 'Insufficient tokens') {
      return NextResponse.json({ error: 'Not enough tokens' }, { status: 402 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('[shop/purchase]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
