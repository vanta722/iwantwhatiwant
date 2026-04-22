import Link from 'next/link'
import type { Kid } from '@prisma/client'
import { AvatarDisplay } from '@/components/kid/avatar-display'
import { TokenBadge } from '@/components/kid/token-badge'
import { AGE_TIER_LABELS } from '@/types'
import type { AvatarConfig } from '@/types'
import { getStreakEmoji } from '@/lib/utils'

interface KidCardProps {
  kid: Kid
}

export function KidCard({ kid }: KidCardProps) {
  const avatarConfig = kid.avatarConfig as unknown as AvatarConfig

  return (
    <div className="bg-white rounded-4xl p-5 shadow-lg border-2 border-purple-100 hover:border-brand-purple/40 transition-all duration-200">
      <div className="flex items-center gap-4">
        <AvatarDisplay config={avatarConfig} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-fredoka font-semibold text-lg text-gray-900 truncate">{kid.name}</h3>
          <p className="text-sm text-gray-500 font-fredoka">{AGE_TIER_LABELS[kid.ageTier]}</p>
          <div className="flex items-center gap-2 mt-1">
            <TokenBadge amount={kid.tokenBalance} size="sm" />
            {kid.currentStreak > 0 && (
              <span className="text-sm font-fredoka text-gray-600">
                {getStreakEmoji(kid.currentStreak)} {kid.currentStreak} day streak
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
