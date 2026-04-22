'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useKidStore } from '@/store/kid-store'
import { Button } from '@/components/ui/button'
import { Home, RotateCcw } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

const EMOJI_SETS = {
  easy:   ['🌟', '🎮', '🦄', '🚀', '🍕', '🎯'],                              // 6 pairs = 12 cards
  medium: ['🌟', '🎮', '🦄', '🚀', '🍕', '🎯', '🐱', '🎸'],                 // 8 pairs = 16 cards
  hard:   ['🌟', '🎮', '🦄', '🚀', '🍕', '🎯', '🐱', '🎸', '💎', '🦊', '🏆', '🤖'], // 12 pairs = 24 cards
}

const DIFFICULTY_CONFIG = {
  easy:   { cols: 4, label: 'Easy',   color: 'from-brand-green to-emerald-400', base: 10, bonusMoves: 18, bonusTokens: 10 },
  medium: { cols: 4, label: 'Medium', color: 'from-brand-blue to-cyan-400',     base: 15, bonusMoves: 24, bonusTokens: 15 },
  hard:   { cols: 6, label: 'Hard',   color: 'from-brand-purple to-pink-500',   base: 20, bonusMoves: 32, bonusTokens: 25 },
}

type Difficulty = keyof typeof EMOJI_SETS
type Phase = 'select' | 'playing' | 'won'

interface Card {
  id: number
  pairId: number
  emoji: string
  isMatched: boolean
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(emojis: string[]): Card[] {
  return shuffled(
    emojis.flatMap((emoji, i) => [
      { id: i * 2,     pairId: i, emoji, isMatched: false },
      { id: i * 2 + 1, pairId: i, emoji, isMatched: false },
    ])
  )
}

// ── Card component ────────────────────────────────────────────────────────────

function MemCard({
  card,
  isFlipped,
  isWrong,
  onClick,
}: {
  card: Card
  isFlipped: boolean
  isWrong: boolean
  onClick: () => void
}) {
  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{ perspective: 800 }}
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full aspect-square"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          x: isWrong ? [-4, 4, -3, 3, 0] : 0,
        }}
        transition={
          isWrong
            ? { duration: 0.35, ease: 'easeInOut' }
            : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
        }
      >
        {/* Back face */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center shadow-md"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-2xl opacity-60">✨</span>
        </div>

        {/* Front face */}
        <div
          className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-md transition-colors duration-300 ${
            card.isMatched
              ? 'bg-green-100 border-[3px] border-brand-green shadow-[0_0_14px_2px_rgba(34,197,94,0.45)]'
              : 'bg-white border-2 border-purple-100'
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <motion.span
            className="text-3xl leading-none"
            animate={card.isMatched ? { scale: [1, 1.35, 1] } : undefined}
            transition={{ duration: 0.35 }}
          >
            {card.emoji}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main game component ───────────────────────────────────────────────────────

export function MemoryMatchGame({ onEarnTokens }: { onEarnTokens: (n: number) => Promise<unknown> }) {
  const router = useRouter()
  const updateTokenBalance = useKidStore((s) => s.updateTokenBalance)

  const [diff, setDiff] = useState<Difficulty>('medium')
  const [phase, setPhase] = useState<Phase>('select')
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])        // card ids currently face-up (max 2)
  const [wrong, setWrong] = useState<number[]>([])            // card ids shaking (mismatch)
  const [matched, setMatched] = useState<Set<number>>(new Set()) // matched pairIds
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [tokensEarned, setTokensEarned] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const cfg = DIFFICULTY_CONFIG[diff]
  const emojis = EMOJI_SETS[diff]
  const totalPairs = emojis.length

  const startGame = useCallback(() => {
    setCards(buildDeck(emojis))
    setFlipped([])
    setWrong([])
    setMatched(new Set())
    setMoves(0)
    setTime(0)
    setIsLocked(false)
    setPhase('playing')
  }, [emojis])

  // Timer
  useEffect(() => {
    if (phase !== 'playing') { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  // Win check
  useEffect(() => {
    if (phase !== 'playing' || matched.size < totalPairs) return
    clearInterval(timerRef.current)
    const tokens = cfg.base + (moves <= cfg.bonusMoves ? cfg.bonusTokens : 0)
    setTokensEarned(tokens)
    setPhase('won')
    onEarnTokens(tokens)
      .then((res: unknown) => {
        if (res && typeof res === 'object' && 'newBalance' in res) {
          updateTokenBalance((res as { newBalance: number }).newBalance)
        }
      })
      .catch(console.error)
  }, [matched, phase, totalPairs])

  const handleFlip = useCallback(
    (cardId: number) => {
      if (isLocked) return
      const card = cards.find((c) => c.id === cardId)
      if (!card || card.isMatched || flipped.includes(cardId)) return
      if (flipped.length === 2) return

      const newFlipped = [...flipped, cardId]
      setFlipped(newFlipped)

      if (newFlipped.length < 2) return

      // Two cards face-up — evaluate
      setMoves((m) => m + 1)
      setIsLocked(true)

      const [a, b] = newFlipped.map((id) => cards.find((c) => c.id === id)!)
      if (a.pairId === b.pairId) {
        // Match ✅
        setTimeout(() => {
          setCards((cs) => cs.map((c) => (c.id === a.id || c.id === b.id ? { ...c, isMatched: true } : c)))
          setMatched((m) => { const n = new Set(m); n.add(a.pairId); return n })
          setFlipped([])
          setIsLocked(false)
        }, 500)
      } else {
        // Mismatch ❌
        setWrong(newFlipped)
        setTimeout(() => {
          setWrong([])
          setFlipped([])
          setIsLocked(false)
        }, 950)
      }
    },
    [cards, flipped, isLocked]
  )

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── Render: select difficulty ──────────────────────────────────────────────

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-purple to-brand-blue flex flex-col items-center justify-center px-5 py-10">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-8xl mb-4">🃏</motion.div>
        <h1 className="font-fredoka font-bold text-4xl text-white mb-1">Memory Match</h1>
        <p className="font-fredoka text-white/70 mb-8 text-lg">Flip cards, find all pairs!</p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setDiff(d); startGame() }}
              className={`bg-gradient-to-r ${DIFFICULTY_CONFIG[d].color} rounded-3xl p-5 text-white text-left shadow-xl`}
            >
              <div className="font-fredoka font-bold text-xl">{DIFFICULTY_CONFIG[d].label}</div>
              <div className="font-fredoka text-white/80 text-sm">
                {EMOJI_SETS[d].length} pairs · +{DIFFICULTY_CONFIG[d].base}–{DIFFICULTY_CONFIG[d].base + DIFFICULTY_CONFIG[d].bonusTokens} tokens
              </div>
            </motion.button>
          ))}
        </div>

        <button onClick={() => router.back()} className="mt-8 text-white/50 font-fredoka flex items-center gap-1 text-sm">
          <Home size={14} /> Back to Games
        </button>
      </div>
    )
  }

  // ── Render: playing ────────────────────────────────────────────────────────

  if (phase === 'playing') {
    return (
      <div className="min-h-screen bg-[#f0f4ff] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b-2 border-purple-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <button onClick={() => { clearInterval(timerRef.current); setPhase('select') }} className="text-gray-400">
            <Home size={20} />
          </button>
          <span className="font-fredoka font-semibold text-brand-purple flex-1">Memory Match</span>
          <div className="flex gap-3 text-sm font-fredoka">
            <span className="bg-brand-purple/10 text-brand-purple rounded-full px-3 py-1">⏱ {fmt(time)}</span>
            <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1">🎯 {moves}</span>
            <span className="bg-brand-green/10 text-brand-green rounded-full px-3 py-1">✓ {matched.size}/{totalPairs}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-4 flex items-start justify-center">
          <div
            className={`grid gap-2.5 w-full max-w-sm`}
            style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)` }}
          >
            {cards.map((card) => (
              <MemCard
                key={card.id}
                card={card}
                isFlipped={card.isMatched || flipped.includes(card.id)}
                isWrong={wrong.includes(card.id)}
                onClick={() => handleFlip(card.id)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Render: won ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple to-brand-blue flex flex-col items-center justify-center px-5 text-center">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-9xl mb-4">🏆</motion.div>

      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="font-fredoka font-bold text-4xl text-white mb-2">
        You did it!
      </motion.h2>

      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, type: 'spring' }} className="bg-white rounded-4xl p-6 w-full max-w-xs mb-6 shadow-2xl">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Moves', value: moves, emoji: '🎯' },
            { label: 'Time',  value: fmt(time), emoji: '⏱' },
            { label: 'Pairs', value: `${totalPairs}/${totalPairs}`, emoji: '✅' },
            { label: moves <= cfg.bonusMoves ? 'BONUS!' : 'Tokens', value: `+${tokensEarned}`, emoji: '🪙' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="bg-purple-50 rounded-3xl p-3 text-center">
              <div className="text-2xl">{emoji}</div>
              <div className="font-fredoka font-bold text-lg text-gray-900">{value}</div>
              <div className="font-fredoka text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1, type: 'spring', stiffness: 300 }} className="bg-brand-yellow rounded-3xl p-3 flex items-center justify-center gap-2">
          <span className="text-2xl">🪙</span>
          <span className="font-fredoka font-bold text-xl text-gray-900">+{tokensEarned} tokens!</span>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="yellow" size="lg" onClick={startGame} className="w-full gap-2"><RotateCcw size={18} />Play Again</Button>
        <Button variant="ghost" size="md" onClick={() => router.push('/games')} className="w-full">Back to Games</Button>
      </motion.div>
    </div>
  )
}
