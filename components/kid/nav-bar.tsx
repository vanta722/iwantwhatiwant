'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Gamepad2, ShoppingBag, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TokenBadge } from './token-badge'
import { useKidStore } from '@/store/kid-store'

const NAV_ITEMS = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/learn', icon: BookOpen, label: 'Learn' },
  { href: '/games', icon: Gamepad2, label: 'Games' },
  { href: '/shop', icon: ShoppingBag, label: 'Shop' },
]

export function KidNavBar() {
  const pathname = usePathname()
  const kid = useKidStore((s) => s.kid)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto max-w-lg">
        <div className="bg-white/95 backdrop-blur-lg border-t-2 border-purple-100 rounded-t-3xl shadow-2xl px-4 pt-3 pb-4">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = pathname.startsWith(href)
              return (
                <Link key={href} href={href} className="flex-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className={cn(
                        'flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200',
                        active
                          ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                          : 'text-gray-400 hover:text-brand-purple'
                      )}
                    >
                      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                    </motion.div>
                    <span
                      className={cn(
                        'text-xs font-fredoka font-medium',
                        active ? 'text-brand-purple' : 'text-gray-400'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                </Link>
              )
            })}

            {/* Parent exit */}
            <Link href="/dashboard" className="flex-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl text-gray-300 hover:text-gray-500 transition-colors">
                  <Lock size={20} />
                </div>
                <span className="text-xs font-fredoka font-medium text-gray-300">Parent</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
