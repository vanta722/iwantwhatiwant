'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PinPadProps {
  onComplete: (pin: string) => void
  isLoading?: boolean
  error?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']
const PIN_LENGTH = 4

export function PinPad({ onComplete, isLoading, error }: PinPadProps) {
  const [pin, setPin] = useState('')
  const [shake, setShake] = useState(false)

  const handleKey = (key: string) => {
    if (isLoading) return

    if (key === 'del') {
      setPin((p) => p.slice(0, -1))
      return
    }

    if (pin.length >= PIN_LENGTH) return
    const newPin = pin + key
    setPin(newPin)

    if (newPin.length === PIN_LENGTH) {
      onComplete(newPin)
    }
  }

  // Shake on error
  if (error && pin.length === PIN_LENGTH) {
    setTimeout(() => {
      setPin('')
    }, 600)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Dots */}
      <motion.div
        className="flex gap-4"
        animate={error ? { x: [-8, 8, -6, 6, 0] } : undefined}
        transition={{ duration: 0.4 }}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'w-5 h-5 rounded-full border-3 border-brand-purple transition-all duration-150',
              i < pin.length ? 'bg-brand-purple scale-110' : 'bg-transparent'
            )}
            animate={i < pin.length ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.15 }}
          />
        ))}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-500 font-fredoka text-sm font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleKey(key)}
              disabled={isLoading}
              className={cn(
                'h-16 rounded-3xl font-fredoka text-2xl font-semibold',
                'flex items-center justify-center',
                'transition-colors duration-100',
                key === 'del'
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-white text-brand-purple hover:bg-brand-purple/10 shadow-md border-2 border-purple-100'
              )}
            >
              {key === 'del' ? <Delete size={22} /> : key}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
