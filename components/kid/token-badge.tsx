'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatTokens } from '@/lib/utils'

interface TokenBadgeProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animate?: boolean
}

export function TokenBadge({ amount, size = 'md', className, animate = false }: TokenBadgeProps) {
  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1',
    md: 'h-10 px-4 text-base gap-1.5',
    lg: 'h-14 px-6 text-xl gap-2',
  }
  const coinSizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }

  return (
    <motion.div
      className={cn(
        'inline-flex items-center rounded-full bg-brand-yellow shadow-md font-fredoka font-semibold text-gray-900',
        'border-2 border-yellow-400',
        sizes[size],
        className
      )}
      animate={animate ? { scale: [1, 1.2, 1] } : undefined}
      transition={{ duration: 0.4 }}
    >
      <span className={coinSizes[size]}>🪙</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={amount}
          initial={animate ? { y: -10, opacity: 0 } : undefined}
          animate={animate ? { y: 0, opacity: 1 } : undefined}
          exit={animate ? { y: 10, opacity: 0 } : undefined}
          transition={{ duration: 0.2 }}
        >
          {formatTokens(amount)}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
