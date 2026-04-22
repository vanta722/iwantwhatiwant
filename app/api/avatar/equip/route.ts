import { NextRequest, NextResponse } from 'next/server'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { AvatarConfig } from '@/types'

const EquipSchema = z.object({
  itemId: z.string().min(1),
})

// Maps ItemType → which AvatarConfig field it controls
const ITEM_TYPE_TO_FIELD: Record<string, keyof AvatarConfig | null> = {
  AVATAR_ACCESSORY: 'accessory',
  PET:              'pet',
  AVATAR_FRAME:     'frame',
  AVATAR_EFFECT:    'effect',
  BACKGROUND:       'background',
  AVATAR_COLOR:     'baseColor',
  COSMETIC:         null,
  GAME_UNLOCK:      null,
}

export async function POST(req: NextRequest) {
  try {
    const session = await getKidSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { itemId } = EquipSchema.parse(body)

    const [inventoryItem, kid] = await Promise.all([
      prisma.inventoryItem.findUnique({
        where: { kidId_itemId: { kidId: session.kidId, itemId } },
        include: { item: true },
      }),
      prisma.kid.findUnique({ where: { id: session.kidId }, select: { avatarConfig: true } }),
    ])

    if (!inventoryItem) return NextResponse.json({ error: 'Item not in inventory' }, { status: 403 })
    if (!kid) return NextResponse.json({ error: 'Kid not found' }, { status: 404 })

    const field = ITEM_TYPE_TO_FIELD[inventoryItem.item.type]
    if (!field) return NextResponse.json({ error: 'This item type cannot be equipped' }, { status: 400 })

    const cfg = inventoryItem.item.config as { value?: string; color?: string; emoji?: string }
    const value = cfg.value ?? cfg.color ?? null

    const currentConfig = kid.avatarConfig as unknown as AvatarConfig

    // Toggle: equipping same item again = unequip it
    const isAlreadyEquipped = (currentConfig[field] as string | null | undefined) === value
    const newValue = isAlreadyEquipped ? null : value

    const newConfig: AvatarConfig = { ...currentConfig, [field]: newValue }

    await prisma.kid.update({
      where: { id: session.kidId },
      data: { avatarConfig: newConfig as object },
    })

    return NextResponse.json({ ok: true, equipped: !isAlreadyEquipped, avatarConfig: newConfig })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    console.error('[avatar/equip]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
