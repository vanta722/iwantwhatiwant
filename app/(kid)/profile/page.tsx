import { redirect } from 'next/navigation'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { AvatarDisplay } from '@/components/kid/avatar-display'
import { TokenBadge } from '@/components/kid/token-badge'
import { InventoryClient } from './inventory-client'
import type { AvatarConfig } from '@/types'

export default async function ProfilePage() {
  const session = await getKidSession()
  if (!session) redirect('/')

  const kid = await prisma.kid.findUnique({
    where: { id: session.kidId },
    select: {
      name: true,
      tokenBalance: true,
      currentStreak: true,
      ageTier: true,
      avatarConfig: true,
      inventory: {
        include: { item: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!kid) redirect('/')

  const avatarConfig = kid.avatarConfig as unknown as AvatarConfig

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Avatar hero */}
      <div className="bg-gradient-to-br from-brand-purple to-brand-blue rounded-4xl p-8 text-center mb-6 relative overflow-hidden">
        {/* Subtle bg dots */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <AvatarDisplay config={avatarConfig} size="xl" animate />
          </div>
          <h1 className="font-fredoka font-bold text-3xl text-white">{kid.name}</h1>
          <div className="flex items-center justify-center gap-3 mt-2">
            <TokenBadge amount={kid.tokenBalance} size="md" />
            {kid.currentStreak > 0 && (
              <span className="bg-white/20 text-white font-fredoka font-semibold text-sm px-3 py-1.5 rounded-full">
                🔥 {kid.currentStreak} day streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <InventoryClient
        kidId={session.kidId}
        initialConfig={avatarConfig}
        inventory={kid.inventory.map((inv) => ({
          id: inv.itemId,
          name: inv.item.name,
          description: inv.item.description ?? '',
          type: inv.item.type,
          config: inv.item.config as { emoji: string; value?: string; color?: string },
        }))}
      />

      {kid.inventory.length === 0 && (
        <div className="text-center py-12 bg-white rounded-4xl border-2 border-dashed border-purple-200">
          <div className="text-5xl mb-3">🛍️</div>
          <h3 className="font-fredoka font-semibold text-lg text-gray-700 mb-1">No items yet!</h3>
          <p className="font-fredoka text-gray-500 text-sm">
            Earn tokens by learning and playing games, then head to the Shop!
          </p>
        </div>
      )}
    </div>
  )
}
