import { getKidSession } from '@/lib/kid-session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { ShopItem } from '@prisma/client'
import { ShopGrid } from './shop-grid'

export default async function ShopPage() {
  const session = await getKidSession()
  if (!session) redirect('/')

  const [kid, items, inventory] = await Promise.all([
    prisma.kid.findUnique({ where: { id: session.kidId }, select: { tokenBalance: true, name: true } }),
    prisma.shopItem.findMany({ where: { isActive: true }, orderBy: { tokenCost: 'asc' } }),
    prisma.inventoryItem.findMany({ where: { kidId: session.kidId }, select: { itemId: true, equipped: true } }),
  ])

  if (!kid) redirect('/')

  const ownedItemIds = new Set(inventory.map((i) => i.itemId))

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-pink to-brand-purple rounded-4xl p-6 text-white mb-6">
        <h1 className="font-fredoka font-bold text-3xl mb-1">🛍️ Token Shop</h1>
        <p className="font-fredoka text-white/80">Spend your hard-earned tokens!</p>
        <div className="mt-3 bg-white/20 rounded-2xl px-4 py-2 w-fit flex items-center gap-2">
          <span className="text-xl">🪙</span>
          <span className="font-fredoka font-bold text-xl">{kid.tokenBalance.toLocaleString()} tokens</span>
        </div>
      </div>

      <ShopGrid
        items={items}
        ownedItemIds={Array.from(ownedItemIds)}
        kidTokenBalance={kid.tokenBalance}
        kidId={session.kidId}
      />

      {items.length === 0 && (
        <div className="text-center py-16 bg-white rounded-4xl border-2 border-dashed border-purple-200">
          <div className="text-5xl mb-3">🏗️</div>
          <h3 className="font-fredoka font-semibold text-lg text-gray-700">Shop Coming Soon!</h3>
          <p className="font-fredoka text-gray-500 text-sm mt-1">Keep earning tokens — awesome items are on the way!</p>
        </div>
      )}
    </div>
  )
}
