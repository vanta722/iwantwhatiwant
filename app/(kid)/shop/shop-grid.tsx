'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ShopItem } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { useKidStore } from '@/store/kid-store'

interface ShopGridProps {
  items: ShopItem[]
  ownedItemIds: string[]
  kidTokenBalance: number
  kidId: string
}

export function ShopGrid({ items, ownedItemIds, kidTokenBalance, kidId }: ShopGridProps) {
  const [owned, setOwned] = useState(new Set(ownedItemIds))
  const [balance, setBalance] = useState(kidTokenBalance)
  const [buying, setBuying] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const updateTokenBalance = useKidStore((s) => s.updateTokenBalance)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const purchase = async (item: ShopItem) => {
    if (owned.has(item.id)) return
    if (balance < item.tokenCost) { showToast('Not enough tokens! Keep learning to earn more. 💪'); return }
    setBuying(item.id)
    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setOwned((prev) => { const next = new Set(prev); next.add(item.id); return next })
      setBalance(data.newBalance)
      updateTokenBalance(data.newBalance)
      showToast(`🎉 You got ${item.name}!`)
    } catch {
      showToast('Purchase failed. Try again!')
    } finally {
      setBuying(null)
    }
  }

  const config = (item: ShopItem) => item.config as { emoji: string; color?: string }

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white font-fredoka px-5 py-3 rounded-3xl shadow-2xl text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const isOwned = owned.has(item.id)
          const canAfford = balance >= item.tokenCost
          const cfg = config(item)

          return (
            <motion.div
              key={item.id}
              whileTap={!isOwned ? { scale: 0.97 } : undefined}
              className={`bg-white rounded-4xl p-4 shadow-sm border-2 text-center transition-all ${
                isOwned ? 'border-brand-green/40 bg-green-50' : 'border-purple-100'
              }`}
            >
              <div className="text-5xl mb-2">{cfg.emoji}</div>
              <h3 className="font-fredoka font-semibold text-base text-gray-900 leading-tight mb-1">{item.name}</h3>
              {item.description && (
                <p className="font-fredoka text-xs text-gray-500 mb-3 leading-tight">{item.description}</p>
              )}

              {isOwned ? (
                <div className="bg-brand-green/20 rounded-2xl py-2">
                  <span className="font-fredoka font-semibold text-brand-green text-sm">✓ Owned!</span>
                </div>
              ) : (
                <button
                  onClick={() => purchase(item)}
                  disabled={buying === item.id}
                  className={`w-full rounded-2xl py-2 font-fredoka font-semibold text-sm transition-all ${
                    canAfford
                      ? 'bg-brand-yellow text-gray-900 hover:brightness-105 active:scale-95 shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {buying === item.id ? '...' : `🪙 ${item.tokenCost.toLocaleString()}`}
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
