'use client'

import { AVATAR_COLORS, AVATAR_EYES, PET_EMOJIS, ACCESSORY_EMOJIS } from '@/types'
import type { AvatarConfig } from '@/types'
import { cn } from '@/lib/utils'

interface AvatarDisplayProps {
  config: AvatarConfig
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: { outer: 'w-12 h-12', face: 'text-2xl', badge: 'text-xs -right-1 -top-1', pet: 'text-sm -right-2 -bottom-1' },
  md: { outer: 'w-20 h-20', face: 'text-4xl', badge: 'text-sm -right-2 -top-1', pet: 'text-xl -right-3 -bottom-1' },
  lg: { outer: 'w-32 h-32', face: 'text-6xl', badge: 'text-lg -right-2 -top-1', pet: 'text-3xl -right-4 -bottom-2' },
  xl: { outer: 'w-44 h-44', face: 'text-8xl', badge: 'text-xl -right-3 -top-2', pet: 'text-4xl -right-5 -bottom-2' },
}

export function AvatarDisplay({ config, size = 'md', animate = false, className }: AvatarDisplayProps) {
  const s = SIZE_MAP[size]
  const bgColor = AVATAR_COLORS[config.baseColor] ?? '#7C3AED'
  const eyeEmoji = AVATAR_EYES[config.eyeType] ?? '😊'

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center shadow-lg border-4 border-white/50',
          s.outer,
          animate && 'animate-float'
        )}
        style={{ backgroundColor: bgColor }}
      >
        <span className={cn('leading-none select-none', s.face)}>{eyeEmoji}</span>

        {config.accessory && (
          <span className={cn('absolute -top-3 left-1/2 -translate-x-1/2 leading-none', s.badge)}>
            {ACCESSORY_EMOJIS[config.accessory]}
          </span>
        )}
      </div>

      {config.pet && (
        <span className={cn('absolute leading-none', s.pet)}>
          {PET_EMOJIS[config.pet]}
        </span>
      )}
    </div>
  )
}
