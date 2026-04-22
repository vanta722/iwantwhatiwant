'use client'

import { motion } from 'framer-motion'
import { AVATAR_COLORS, AVATAR_EYES, PET_EMOJIS, ACCESSORY_EMOJIS, FRAME_STYLES } from '@/types'
import type { AvatarConfig } from '@/types'
import { cn } from '@/lib/utils'

interface AvatarDisplayProps {
  config: AvatarConfig
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

const SIZE_MAP = {
  sm:  { outer: 'w-12 h-12',  face: 'text-2xl', acc: 'text-sm -top-3',  pet: 'text-sm -right-2 -bottom-1',  border: 'border-[3px]' },
  md:  { outer: 'w-20 h-20',  face: 'text-4xl', acc: 'text-lg -top-4',  pet: 'text-xl -right-3 -bottom-1',  border: 'border-4' },
  lg:  { outer: 'w-32 h-32',  face: 'text-6xl', acc: 'text-2xl -top-5', pet: 'text-3xl -right-4 -bottom-2', border: 'border-[5px]' },
  xl:  { outer: 'w-44 h-44',  face: 'text-8xl', acc: 'text-4xl -top-7', pet: 'text-5xl -right-6 -bottom-3', border: 'border-[6px]' },
}

const EFFECT_PARTICLES: Record<string, { icons: string[]; count: number }> = {
  sparkle: { icons: ['✨', '⭐', '💫'], count: 5 },
  stars:   { icons: ['🌟', '⭐', '✨'], count: 6 },
  glow:    { icons: ['💛', '💜', '💙'], count: 0 },
}

export function AvatarDisplay({ config, size = 'md', animate = false, className }: AvatarDisplayProps) {
  const s = SIZE_MAP[size]
  const bgColor = AVATAR_COLORS[config.baseColor] ?? '#7C3AED'
  const eyeEmoji = AVATAR_EYES[config.eyeType] ?? '😊'
  const frame = config.frame ? FRAME_STYLES[config.frame] : null
  const effect = config.effect ? EFFECT_PARTICLES[config.effect] : null

  const outerSizes = { sm: 60, md: 96, lg: 148, xl: 200 }
  const outerPx = outerSizes[size]

  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Effect particles orbiting the avatar */}
      {effect && effect.count > 0 && animate &&
        Array.from({ length: effect.count }).map((_, i) => {
          const angle = (i / effect.count) * 360
          const radius = outerPx * 0.6
          return (
            <motion.span
              key={i}
              className="absolute text-sm pointer-events-none z-10 leading-none"
              style={{
                left: '50%',
                top: '50%',
              }}
              animate={{
                rotate: [angle, angle + 360],
                x: [
                  Math.cos((angle * Math.PI) / 180) * radius,
                  Math.cos(((angle + 180) * Math.PI) / 180) * radius,
                  Math.cos(((angle + 360) * Math.PI) / 180) * radius,
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * radius,
                  Math.sin(((angle + 180) * Math.PI) / 180) * radius,
                  Math.sin(((angle + 360) * Math.PI) / 180) * radius,
                ],
                opacity: [0.7, 1, 0.7],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'linear' }}
            >
              {effect.icons[i % effect.icons.length]}
            </motion.span>
          )
        })
      }

      {/* Glow effect overlay */}
      {config.effect === 'glow' && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            boxShadow: `0 0 ${outerPx * 0.5}px ${outerPx * 0.2}px ${bgColor}99`,
          }}
        />
      )}

      {/* Main avatar circle */}
      <motion.div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          s.outer,
          s.border,
          frame ? frame.border : 'border-white/50',
          animate && 'animate-float'
        )}
        style={{
          backgroundColor: bgColor,
          boxShadow: frame
            ? `0 4px 12px rgba(0,0,0,0.2), ${frame.shadow}`
            : '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <span className={cn('leading-none select-none', s.face)}>{eyeEmoji}</span>

        {config.accessory && (
          <span className={cn('absolute left-1/2 -translate-x-1/2 leading-none', s.acc)}>
            {ACCESSORY_EMOJIS[config.accessory]}
          </span>
        )}
      </motion.div>

      {/* Pet buddy */}
      {config.pet && (
        <span className={cn('absolute leading-none', s.pet)}>
          {PET_EMOJIS[config.pet]}
        </span>
      )}
    </div>
  )
}
