import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-3xl font-fredoka font-semibold transition-all duration-150 active:scale-95 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
  {
    variants: {
      variant: {
        purple: 'bg-brand-purple text-white shadow-[0_4px_0_#5b21b6] hover:brightness-110 active:shadow-none active:translate-y-1',
        orange: 'bg-brand-orange text-white shadow-[0_4px_0_#c2410c] hover:brightness-110 active:shadow-none active:translate-y-1',
        green: 'bg-brand-green text-white shadow-[0_4px_0_#15803d] hover:brightness-110 active:shadow-none active:translate-y-1',
        blue: 'bg-brand-blue text-white shadow-[0_4px_0_#1d4ed8] hover:brightness-110 active:shadow-none active:translate-y-1',
        pink: 'bg-brand-pink text-white shadow-[0_4px_0_#9d174d] hover:brightness-110 active:shadow-none active:translate-y-1',
        yellow: 'bg-brand-yellow text-gray-900 shadow-[0_4px_0_#a16207] hover:brightness-110 active:shadow-none active:translate-y-1',
        ghost: 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm',
        outline: 'bg-white border-2 border-brand-purple text-brand-purple hover:bg-brand-purple/10',
        danger: 'bg-red-500 text-white shadow-[0_4px_0_#b91c1c] hover:brightness-110 active:shadow-none active:translate-y-1',
      },
      size: {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
        icon: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'purple',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
