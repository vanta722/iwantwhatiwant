'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarDisplay } from '@/components/kid/avatar-display'
import { useKidStore } from '@/store/kid-store'
import type { AvatarConfig } from '@/types'

type ItemType = 'AVATAR_ACCESSORY' | 'PET' | 'AVATAR_FRAME' | 'AVATAR_EFFECT' | 'BACKGROUND' | 'AVATAR_COLOR' | 'COSMETIC' | 'GAME_UNLOCK'

interface InventoryItem {
  id: string
  name: string
  description: string
  type: ItemType
  config: { emoji: string; value?: string; color?: string }
}

// Which AvatarConfig field each type maps to
const TYPE_TO_FIELD: Partial<Record<ItemType, keyof AvatarConfig>> = {
  AVATAR_ACCESSORY: 'accessory',
  PET:              'pet',
  AVATAR_FRAME:     'frame',
  AVATAR_EFFECT:    'effect',
  BACKGROUND:       'background',
}

const CATEGORY_LABELS: Partial<Record<ItemType, string>> = {
  AVATAR_ACCESSORY: 'Accessories',
  PET:              'Pets',
  AVATAR_FRAME:     'Frames',
  AVATAR_EFFECT:    'Effects',
  BACKGROUND:       'Backgrounds',
  COSMETIC:         'Cosmetics',
}

const CATEGORY_ORDER: ItemType[] = ['AVATAR_FRAME', 'AVATAR_EFFECT', 'PET', 'AVATAR_ACCESSORY', 'BACKGROUND', 'COSMETIC']

function isEquipped(config: AvatarConfig, item: InventoryItem): boolean {
  const field = TYPE_TO_FIELD[item.type]
  if (!field) return false
  const val = item.config.value ?? item.config.color ?? null
  return (config[field] as string | null | undefined) === val
}

interface Props {
  kidId: string
  initialConfig: AvatarConfig
  inventory: InventoryItem[]
}

export function InventoryClient({ kidId, initialConfig, inventory }: Props) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig)
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const setKid = useKidStore((s) => s.setKid)
  const kid = useKidStore((s) => s.kid)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const equip = async (item: InventoryItem) => {
    setLoading(item.id)
    try {
      const res = await fetch('/api/avatar/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setConfig(data.avatarConfig)
      // Sync Zustand store
      if (kid) setKid({ ...kid, avatarConfig: data.avatarConfig })
      showToast(data.equipped ? `✅ Equipped ${item.name}!` : `👋 Unequipped ${item.name}`)
    } catch {
      showToast('Something went wrong!')
    } finally {
      setLoading(null)
    }
  }

  // Group inventory by category
  const grouped = CATEGORY_ORDER.reduce<Record<string, InventoryItem[]>>((acc, type) => {
    const items = inventory.filter((i) => i.type === type)
    if (items.length > 0) acc[type] = items
    return acc
  }, {})

  if (inventory.length === 0) return null

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white font-fredoka px-5 py-3 rounded-3xl shadow-2xl text-sm whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live preview */}
      <div className="bg-white rounded-4xl p-5 shadow-sm border-2 border-purple-100">
        <h2 className="font-fredoka font-semibold text-lg text-gray-800 mb-4 text-center">🎨 Live Preview</h2>
        <div className="flex justify-center">
          <AvatarDisplay config={config} size="xl" animate />
        </div>
        {config.background && (
          <p className="text-center font-fredoka text-sm text-gray-500 mt-3">
            Background active on Home screen
          </p>
        )}
      </div>

      {/* Inventory by category */}
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h3 className="font-fredoka font-semibold text-base text-gray-700 mb-3">
            {CATEGORY_LABELS[type as ItemType] ?? type}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {items.map((item) => {
              const equipped = isEquipped(config, item)
              const busy = loading === item.id

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => equip(item)}
                  disabled={busy}
                  className={`rounded-3xl p-3 text-center transition-all border-2 ${
                    equipped
                      ? 'bg-brand-purple text-white border-brand-purple shadow-lg shadow-brand-purple/30'
                      : 'bg-white border-purple-100 hover:border-brand-purple/50'
                  }`}
                >
                  <div className="text-4xl mb-1.5">{item.config.emoji}</div>
                  <p className={`font-fredoka text-xs font-semibold leading-tight ${equipped ? 'text-white' : 'text-gray-800'}`}>
                    {item.name}
                  </p>
                  <p className={`font-fredoka text-[10px] mt-0.5 ${equipped ? 'text-white/80' : 'text-brand-purple'}`}>
                    {busy ? '...' : equipped ? '✓ On' : 'Tap to equip'}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
