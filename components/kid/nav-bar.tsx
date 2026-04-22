'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Gamepad2, ShoppingBag, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TokenBadge } from './token-badge'
import { useKidStore } from '@/store/kid-store'

const NAV_ITEMS = [
  { href: '/home',    icon: Home,        label: 'Home'  },
  { href: '/learn',   icon: BookOpen,    label: 'Learn' },
  { href: '/games',   icon: Gamepad2,    label: 'Games' },
  { href: '/shop',    icon: ShoppingBag, label: 'Shop'  },
  { href: '/profile', icon: User,        label: 'Avatar' },
]

export function KidNavBar() {
  const pathname = usePathname()
  const kid = useKidStore((s) => s.kid)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto max-w-lg">
        <div className="bg-white/95 backdrop-blur-lg border-t-2 border-purple-100 rounded-t-3xl shadow-2xl px-2 pt-3 pb-4">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/home' && pathname.startsWith(href))
              return (
                <Link key={href} href={href} className="flex-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <motion.div
                      whileTap={{ scale: 0.82 }}
                      className={cn(
                        'flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200',
                        active
                          ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                          : 'text-gray-400 hover:text-brand-purple'
                      )}
                    >
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    </motion.div>
                    <span
                      className={cn(
                        'text-[10px] font-fredoka font-medium',
                        active ? 'text-brand-purple' : 'text-gray-400'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Token balance pill above nav */}
          {kid && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <TokenBadge amount={kid.tokenBalance} size="sm" />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
