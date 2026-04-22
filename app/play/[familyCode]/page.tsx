'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AvatarDisplay } from '@/components/kid/avatar-display'
import { PinPad } from '@/components/kid/pin-pad'
import type { AvatarConfig } from '@/types'

interface KidProfile {
  id: string
  name: string
  avatarConfig: AvatarConfig
  ageTier: string
}

type Phase = 'pick' | 'pin'

export default function PlayPage({ params }: { params: Promise<{ familyCode: string }> }) {
  const { familyCode } = use(params)
  const router = useRouter()
  const [kids, setKids] = useState<KidProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [phase, setPhase] = useState<Phase>('pick')
  const [selectedKid, setSelectedKid] = useState<KidProfile | null>(null)
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/family/${familyCode}`)
      .then(async (res) => {
        if (!res.ok) { setNotFound(true); return }
        const data = await res.json()
        setKids(data.kids)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [familyCode])

  const selectKid = (kid: KidProfile) => {
    setSelectedKid(kid)
    setPhase('pin')
    setPinError('')
  }

  const submitPin = async (pin: string) => {
    if (!selectedKid) return
    setPinLoading(true)
    setPinError('')
    try {
      const res = await fetch('/api/kid-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kidId: selectedKid.id, pin }),
      })
      if (!res.ok) {
        setPinError('Wrong PIN! Try again 🙈')
        setPinLoading(false)
        return
      }
      router.push('/home')
    } catch {
      setPinError('Something went wrong!')
      setPinLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-6xl"
        >
          ⭐
        </motion.div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center text-center px-6">
        <div className="text-8xl mb-4">😕</div>
        <h1 className="font-fredoka font-bold text-3xl text-white mb-2">Oops!</h1>
        <p className="font-fredoka text-white/80 text-lg">
          This family portal doesn&apos;t exist yet. Ask your parent for the right link!
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink px-6 py-10 flex flex-col">
      {/* Stars bg */}
      {['⭐', '🌟', '✨'].map((star, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-20 pointer-events-none"
          style={{ left: `${20 + i * 30}%`, top: `${10 + i * 15}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 2.5 + i, repeat: Infinity }}
        >
          {star}
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        {phase === 'pick' && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center flex-1"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-7xl mb-4"
            >
              🎮
            </motion.div>
            <h1 className="font-fredoka font-bold text-4xl text-white mb-1">Who&apos;s playing?</h1>
            <p className="font-fredoka text-white/70 text-lg mb-8">Tap your avatar to start!</p>

            {kids.length === 0 ? (
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-4xl p-8">
                <p className="font-fredoka text-white text-lg">
                  No kid profiles yet! Ask your parent to create one. 👋
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 w-full max-w-sm">
                {kids.map((kid, i) => (
                  <motion.button
                    key={kid.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => selectKid(kid)}
                    className="flex flex-col items-center gap-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-4xl p-5 hover:bg-white/30 transition-colors"
                  >
                    <AvatarDisplay config={kid.avatarConfig} size="lg" animate />
                    <span className="font-fredoka font-semibold text-xl text-white">{kid.name}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {phase === 'pin' && selectedKid && (
          <motion.div
            key="pin"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            className="flex flex-col items-center flex-1 pt-6"
          >
            <button
              onClick={() => { setPhase('pick'); setPinError('') }}
              className="self-start text-white/60 hover:text-white font-fredoka text-sm mb-6 flex items-center gap-1"
            >
              ← Back
            </button>

            <AvatarDisplay config={selectedKid.avatarConfig} size="xl" animate className="mb-4" />
            <h2 className="font-fredoka font-bold text-3xl text-white mb-1">
              Hi, {selectedKid.name}! 👋
            </h2>
            <p className="font-fredoka text-white/70 text-lg mb-8">Enter your secret PIN</p>

            <div className="bg-white/20 backdrop-blur-sm rounded-4xl p-6 w-full max-w-xs">
              <PinPad onComplete={submitPin} isLoading={pinLoading} error={pinError} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
