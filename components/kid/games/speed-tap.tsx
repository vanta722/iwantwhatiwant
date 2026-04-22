'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useKidStore } from '@/store/kid-store'
import { Button } from '@/components/ui/button'
import { Home, RotateCcw } from 'lucide-react'

// ── Config ────────────────────────────────────────────────────────────────────

const TARGETS = ['🌟', '🎯', '🚀', '🍕', '🎮', '🦄', '🍭', '💎', '🔥', '⚡', '🌈', '🎪']
const COLORS  = ['#7C3AED', '#F97316', '#3B82F6', '#EC4899', '#22C55E', '#EAB308']

const GAME_DURATION  = 30  // seconds
const INITIAL_SPAWN  = 1400 // ms between spawns
const SPAWN_SPEEDUP  = 30   // ms faster per 5 seconds
const TARGET_LIFE    = 2200 // ms before target disappears (miss)
const MAX_TARGETS    = 5    // max simultaneous targets
const MISS_DEDUCTION = 0    // no token deduction, just misses count

type Phase = 'intro' | 'countdown' | 'playing' | 'done'

interface Target {
  id: number
  emoji: string
  color: string
  x: number   // % from left
  y: number   // % from top
  size: number
  bornAt: number
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SpeedTapGame({ onEarnTokens }: { onEarnTokens: (n: number) => Promise<unknown> }) {
  const router = useRouter()
  const updateTokenBalance = useKidStore((s) => s.updateTokenBalance)

  const [phase, setPhase]           = useState<Phase>('intro')
  const [countdown, setCountdown]   = useState(3)
  const [targets, setTargets]       = useState<Target[]>([])
  const [score, setScore]           = useState(0)
  const [misses, setMisses]         = useState(0)
  const [timeLeft, setTimeLeft]     = useState(GAME_DURATION)
  const [tokensEarned, setTokensEarned] = useState(0)
  const [pops, setPops]             = useState<{ id: number; x: number; y: number; emoji: string }[]>([])

  const idRef        = useRef(0)
  const spawnRef     = useRef<ReturnType<typeof setInterval>>(undefined)
  const timerRef     = useRef<ReturnType<typeof setInterval>>(undefined)
  const expiryRef    = useRef<ReturnType<typeof setInterval>>(undefined)
  const timeLeftRef  = useRef(GAME_DURATION)
  const scoreRef     = useRef(0)

  const endGame = useCallback(() => {
    clearInterval(spawnRef.current)
    clearInterval(timerRef.current)
    clearInterval(expiryRef.current)
    const earned = Math.max(1, scoreRef.current)
    setTokensEarned(earned)
    setPhase('done')
    onEarnTokens(earned)
      .then((res: unknown) => {
        if (res && typeof res === 'object' && 'newBalance' in res) {
          updateTokenBalance((res as { newBalance: number }).newBalance)
        }
      })
      .catch(console.error)
  }, [onEarnTokens, updateTokenBalance])

  const spawnTarget = useCallback(() => {
    if (timeLeftRef.current <= 0) return
    setTargets((prev) => {
      if (prev.length >= MAX_TARGETS) return prev
      const id = ++idRef.current
      return [
        ...prev,
        {
          id,
          emoji: TARGETS[Math.floor(Math.random() * TARGETS.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          x: rand(10, 78),
          y: rand(12, 72),
          size: rand(70, 96),
          bornAt: Date.now(),
        },
      ]
    })
  }, [])

  const tapTarget = useCallback((target: Target, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setPops((prev) => [...prev, { id: target.id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, emoji: target.emoji }])
    setTimeout(() => setPops((prev) => prev.filter((p) => p.id !== target.id)), 700)

    setTargets((prev) => prev.filter((t) => t.id !== target.id))
    setScore((s) => { scoreRef.current = s + 1; return s + 1 })
  }, [])

  const startGame = useCallback(() => {
    setTargets([])
    setScore(0)
    setMisses(0)
    setTimeLeft(GAME_DURATION)
    timeLeftRef.current = GAME_DURATION
    scoreRef.current = 0
    idRef.current = 0
    setPhase('countdown')
    setCountdown(3)
  }, [])

  // Countdown → playing
  useEffect(() => {
    if (phase !== 'countdown') return
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); setPhase('playing'); return 0 }
        return c - 1
      })
    }, 900)
    return () => clearInterval(t)
  }, [phase])

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') return

    // Game timer
    timerRef.current = setInterval(() => {
      timeLeftRef.current -= 1
      setTimeLeft(timeLeftRef.current)
      if (timeLeftRef.current <= 0) endGame()
    }, 1000)

    // Spawn targets (speed up over time)
    let elapsed = 0
    const scheduleSpawn = () => {
      const interval = Math.max(600, INITIAL_SPAWN - Math.floor(elapsed / 5000) * SPAWN_SPEEDUP)
      spawnRef.current = setTimeout(() => {
        if (timeLeftRef.current <= 0) return
        spawnTarget()
        elapsed += interval
        scheduleSpawn()
      }, interval)
    }
    scheduleSpawn()

    // Expiry check
    expiryRef.current = setInterval(() => {
      const now = Date.now()
      setTargets((prev) => {
        const expired = prev.filter((t) => now - t.bornAt > TARGET_LIFE)
        if (expired.length > 0) setMisses((m) => m + expired.length)
        return prev.filter((t) => now - t.bornAt <= TARGET_LIFE)
      })
    }, 200)

    return () => {
      clearInterval(timerRef.current)
      clearTimeout(spawnRef.current)
      clearInterval(expiryRef.current)
    }
  }, [phase, spawnTarget, endGame])

  // ── Render ─────────────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-orange to-brand-pink flex flex-col items-center justify-center px-5 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-9xl mb-4">⚡</motion.div>
        <h1 className="font-fredoka font-bold text-4xl text-white mb-2">Speed Tap!</h1>
        <p className="font-fredoka text-white/80 text-xl mb-3">Tap the targets before they vanish!</p>
        <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-4 mb-8 text-left space-y-2">
          <p className="font-fredoka text-white font-medium">⚡ {GAME_DURATION} seconds to score as high as you can</p>
          <p className="font-fredoka text-white font-medium">🎯 Each tap = 1 token</p>
          <p className="font-fredoka text-white font-medium">💨 Targets get faster over time!</p>
        </div>
        <Button variant="yellow" size="xl" onClick={startGame} className="w-full max-w-xs text-2xl font-bold">
          Let&apos;s Go! 🚀
        </Button>
        <button onClick={() => router.back()} className="mt-6 text-white/50 font-fredoka text-sm flex items-center gap-1">
          <Home size={14} /> Back to Games
        </button>
      </div>
    )
  }

  if (phase === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-orange to-brand-pink flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="font-fredoka font-bold text-9xl text-white"
          >
            {countdown}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  if (phase === 'playing') {
    const pct = (timeLeft / GAME_DURATION) * 100
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden select-none">
        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-fredoka font-bold text-2xl text-white">⚡ {score}</span>
            <span className={`font-fredoka font-bold text-xl ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>⏱ {timeLeft}s</span>
            <span className="font-fredoka text-gray-400 text-sm">😅 {misses}</span>
          </div>
          {/* Timer bar */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timeLeft <= 10 ? 'bg-red-400' : 'bg-brand-yellow'}`}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Pop particles */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {pops.map((pop) => (
            <motion.div
              key={pop.id}
              className="absolute text-4xl"
              style={{ left: pop.x, top: pop.y, translateX: '-50%', translateY: '-50%' }}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0, y: -60 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {pop.emoji}
            </motion.div>
          ))}
        </div>

        {/* Targets */}
        <AnimatePresence>
          {targets.map((t) => {
            const age = (Date.now() - t.bornAt) / TARGET_LIFE
            return (
              <motion.button
                key={t.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.1, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'backOut' }}
                whileTap={{ scale: 0.7 }}
                onClick={(e) => tapTarget(t, e)}
                className="absolute rounded-full flex items-center justify-center shadow-2xl active:shadow-none"
                style={{
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  width: t.size,
                  height: t.size,
                  backgroundColor: t.color,
                  boxShadow: `0 0 30px 8px ${t.color}80`,
                  border: '3px solid rgba(255,255,255,0.3)',
                }}
              >
                <span className="text-4xl leading-none">{t.emoji}</span>
                {/* Shrink ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-white/40"
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 0, opacity: 0 }}
                  transition={{ duration: TARGET_LIFE / 1000, ease: 'linear' }}
                />
              </motion.button>
            )
          })}
        </AnimatePresence>

        {/* Hint */}
        {targets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.p animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="font-fredoka text-white/40 text-xl">
              Get ready...
            </motion.p>
          </div>
        )}
      </div>
    )
  }

  // done
  const grade = score >= 20 ? '🏆' : score >= 10 ? '🌟' : '💪'
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-orange to-brand-pink flex flex-col items-center justify-center px-5 text-center">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-9xl mb-4">{grade}</motion.div>
      <h2 className="font-fredoka font-bold text-4xl text-white mb-6">{score >= 20 ? 'Incredible!' : score >= 10 ? 'Nice speed!' : 'Keep practicing!'}</h2>

      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring' }} className="bg-white rounded-4xl p-6 w-full max-w-xs mb-6 shadow-2xl">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { emoji: '⚡', label: 'Taps',   value: score  },
            { emoji: '😅', label: 'Missed', value: misses },
          ].map(({ emoji, label, value }) => (
            <div key={label} className="bg-orange-50 rounded-3xl p-3 text-center">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="font-fredoka font-bold text-2xl text-gray-900">{value}</div>
              <div className="font-fredoka text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9, type: 'spring', stiffness: 300 }} className="bg-brand-yellow rounded-3xl p-3 flex items-center justify-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="font-fredoka font-bold text-xl text-gray-900">+{tokensEarned} tokens!</span>
        </motion.div>
      </motion.div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="yellow" size="lg" onClick={startGame} className="w-full gap-2"><RotateCcw size={18} />Play Again</Button>
        <Button variant="ghost" size="md" onClick={() => router.push('/games')} className="w-full">Back to Games</Button>
      </div>
    </div>
  )
}
