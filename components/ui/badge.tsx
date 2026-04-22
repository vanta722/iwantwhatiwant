import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-fredoka font-semibold transition-colors',
  {
    variants: {
      variant: {
        token: 'bg-brand-yellow text-gray-900 shadow-sm',
        purple: 'bg-brand-purple text-white',
        green: 'bg-brand-green text-white',
        orange: 'bg-brand-orange text-white',
        pink: 'bg-brand-pink text-white',
        gray: 'bg-gray-200 text-gray-700',
      },
      size: {
        sm: 'h-6 px-2 text-xs',
        md: 'h-8 px-3 text-sm',
        lg: 'h-10 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'purple',
      size: 'md',
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
