'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useKidStore } from '@/store/kid-store'
import type { Question, LessonContent } from '@/types'
import { ChevronRight, Home, RotateCcw } from 'lucide-react'

interface LessonPlayerProps {
  lessonId: string
  title: string
  subject: string
  content: LessonContent
  questions: Question[]
  tokenReward: number
  alreadyCompleted: boolean
}

type Phase = 'content' | 'quiz' | 'results'

const ANSWER_COLORS = [
  { bg: 'bg-brand-purple', shadow: 'shadow-[0_5px_0_#5b21b6]', ring: 'ring-brand-purple' },
  { bg: 'bg-brand-orange', shadow: 'shadow-[0_5px_0_#c2410c]', ring: 'ring-brand-orange' },
  { bg: 'bg-brand-blue', shadow: 'shadow-[0_5px_0_#1d4ed8]', ring: 'ring-brand-blue' },
  { bg: 'bg-brand-pink', shadow: 'shadow-[0_5px_0_#9d174d]', ring: 'ring-brand-pink' },
]

function Particle({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-full pointer-events-none"
      style={{ left: x, top: y, backgroundColor: color }}
      initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.5, 0],
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  )
}

export function LessonPlayer({
  lessonId,
  title,
  subject,
  content,
  questions,
  tokenReward,
  alreadyCompleted,
}: LessonPlayerProps) {
  const router = useRouter()
  const updateTokenBalance = useKidStore((s) => s.updateTokenBalance)
  const kid = useKidStore((s) => s.kid)

  const [phase, setPhase] = useState<Phase>('content')
  const [contentPage, setContentPage] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([])
  const [tokensEarned, setTokensEarned] = useState(0)
  const [saving, setSaving] = useState(false)

  const controls = useAnimation()

  const contentPages = [
    { emoji: '📖', label: 'Introduction', text: content.introduction },
    { emoji: '💡', label: 'The Concept', text: content.concept },
    { emoji: '🔍', label: 'Example', text: content.example },
  ]

  const currentQuestion = questions[questionIndex]
  const totalQuestions = questions.length
  const score = Math.round((correctCount / totalQuestions) * 100)
  const isPerfect = score === 100

  const spawnParticles = useCallback((e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const colors = ['#7C3AED', '#F97316', '#22C55E', '#FCD34D', '#EC4899', '#3B82F6']
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setParticles((prev) => [...prev, ...newParticles])
    setTimeout(() => setParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id))), 1000)
  }, [])

  const handleAnswer = useCallback(
    async (answer: string, e: React.MouseEvent) => {
      if (selectedAnswer !== null) return
      setSelectedAnswer(answer)
      const correct = answer === currentQuestion.correctAnswer
      setIsCorrect(correct)

      if (correct) {
        setCorrectCount((n) => n + 1)
        spawnParticles(e)
        await controls.start({ scale: [1, 1.04, 1], transition: { duration: 0.3 } })
      } else {
        await controls.start({
          x: [-8, 8, -6, 6, -4, 4, 0],
          transition: { duration: 0.4 },
        })
      }

      setTimeout(() => {
        setSelectedAnswer(null)
        setIsCorrect(null)
        if (questionIndex + 1 < totalQuestions) {
          setQuestionIndex((i) => i + 1)
        } else {
          setPhase('results')
        }
      }, 1400)
    },
    [selectedAnswer, currentQuestion, questionIndex, totalQuestions, controls, spawnParticles]
  )

  const saveProgress = useCallback(
    async (finalScore: number) => {
      if (alreadyCompleted) return
      setSaving(true)
      try {
        const res = await fetch(`/api/lessons/${lessonId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: finalScore }),
        })
        if (res.ok) {
          const data = await res.json()
          setTokensEarned(data.tokensEarned)
          if (data.newBalance !== undefined) {
            updateTokenBalance(data.newBalance)
          }
        }
      } finally {
        setSaving(false)
      }
    },
    [lessonId, alreadyCompleted, updateTokenBalance]
  )

  // Save after quiz completes — runs once when phase transitions to 'results'
  useEffect(() => {
    if (phase === 'results' && !alreadyCompleted) {
      saveProgress(score)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className="min-h-screen bg-[#f0f4ff] flex flex-col max-w-lg mx-auto relative overflow-hidden">
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map((p) => (
          <Particle key={p.id} x={p.x} y={p.y} color={p.color} />
        ))}
      </div>

      {/* Header */}
      <div className="bg-white border-b-2 border-purple-100 px-5 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
          <Home size={22} />
        </button>
        <div className="flex-1">
          <p className="font-fredoka text-xs text-gray-400 capitalize">{subject.toLowerCase()}</p>
          <h1 className="font-fredoka font-semibold text-base text-gray-900 leading-tight truncate">{title}</h1>
        </div>
        {phase === 'quiz' && (
          <span className="font-fredoka text-sm font-medium text-brand-purple bg-brand-purple/10 rounded-full px-3 py-1">
            {questionIndex + 1}/{totalQuestions}
          </span>
        )}
      </div>

      {/* Quiz progress bar */}
      {phase === 'quiz' && (
        <Progress value={((questionIndex) / totalQuestions) * 100} className="h-2 rounded-none" />
      )}

      <AnimatePresence mode="wait">
        {/* ── CONTENT PHASE ─────────────────────────────────────────── */}
        {phase === 'content' && (
          <motion.div
            key={`content-${contentPage}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col px-5 py-6"
          >
            {/* Page indicator */}
            <div className="flex gap-2 mb-6">
              {contentPages.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === contentPage
                      ? 'bg-brand-purple flex-1'
                      : i < contentPage
                      ? 'bg-brand-purple/40 w-6'
                      : 'bg-gray-200 w-6'
                  }`}
                />
              ))}
            </div>

            <div className="flex-1">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="text-7xl mb-4 block text-center"
              >
                {contentPages[contentPage].emoji}
              </motion.div>
              <h2 className="font-fredoka font-bold text-2xl text-gray-900 mb-4 text-center">
                {contentPages[contentPage].label}
              </h2>
              <div className="bg-white rounded-4xl p-6 shadow-lg border-2 border-purple-100">
                <p className="font-fredoka text-lg text-gray-800 leading-relaxed">
                  {contentPages[contentPage].text}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {contentPage > 0 && (
                <Button variant="outline" size="lg" onClick={() => setContentPage((p) => p - 1)} className="flex-1">
                  ← Back
                </Button>
              )}
              <Button
                variant="purple"
                size="lg"
                onClick={() => {
                  if (contentPage < contentPages.length - 1) {
                    setContentPage((p) => p + 1)
                  } else {
                    setPhase('quiz')
                  }
                }}
                className="flex-1 text-lg"
              >
                {contentPage < contentPages.length - 1 ? (
                  <>Next <ChevronRight size={20} /></>
                ) : (
                  <>Let&apos;s Play! 🎮</>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── QUIZ PHASE ────────────────────────────────────────────── */}
        {phase === 'quiz' && currentQuestion && (
          <motion.div
            key={`q-${questionIndex}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col px-5 py-6"
          >
            <motion.div animate={controls}>
              {/* Question */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-4xl p-6 shadow-lg border-2 border-purple-100 mb-6"
              >
                <p className="font-fredoka font-semibold text-xl text-gray-900 text-center leading-snug">
                  {currentQuestion.text}
                </p>
              </motion.div>

              {/* Answers */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, i) => {
                  const colors = ANSWER_COLORS[i % ANSWER_COLORS.length]
                  const chosen = selectedAnswer === option
                  const correct = option === currentQuestion.correctAnswer
                  const showResult = selectedAnswer !== null

                  let stateClass = `${colors.bg} ${colors.shadow} text-white hover:brightness-110`
                  if (showResult) {
                    if (correct) stateClass = 'bg-brand-green shadow-[0_5px_0_#15803d] text-white ring-4 ring-green-300'
                    else if (chosen) stateClass = 'bg-red-500 shadow-[0_5px_0_#b91c1c] text-white ring-4 ring-red-300 animate-shake'
                    else stateClass = `${colors.bg} opacity-40 text-white cursor-not-allowed`
                  }

                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      whileTap={selectedAnswer === null ? { scale: 0.96, y: 4 } : undefined}
                      onClick={(e) => selectedAnswer === null && handleAnswer(option, e)}
                      disabled={selectedAnswer !== null}
                      className={`w-full rounded-3xl px-6 py-5 font-fredoka font-semibold text-lg text-left transition-all duration-200 active:shadow-none active:translate-y-1 ${stateClass}`}
                    >
                      <span className="opacity-70 mr-3">{String.fromCharCode(65 + i)}.</span>
                      {option}
                      {showResult && correct && <span className="float-right">✅</span>}
                      {showResult && chosen && !correct && <span className="float-right">❌</span>}
                    </motion.button>
                  )
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 rounded-3xl p-4 ${
                      isCorrect ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
                    }`}
                  >
                    <p className="font-fredoka font-semibold text-base">
                      {isCorrect ? '🎉 Correct! ' : '😅 Not quite! '}
                      <span className="font-normal text-gray-700">{currentQuestion.explanation}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {/* ── RESULTS PHASE ─────────────────────────────────────────── */}
        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-5 py-8 text-center"
          >
            {/* Trophy reveal */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
              className="text-9xl mb-4"
            >
              {isPerfect ? '🏆' : score >= 60 ? '🌟' : '💪'}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-fredoka font-bold text-4xl text-gray-900 mb-2"
            >
              {isPerfect ? 'PERFECT!' : score >= 60 ? 'Great job!' : 'Keep going!'}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="bg-white rounded-4xl p-6 shadow-xl border-2 border-purple-100 w-full max-w-xs mb-6"
            >
              {/* Score ring */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e9d5ff" strokeWidth="12" />
                  <motion.circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={isPerfect ? '#22C55E' : '#7C3AED'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                    initial={{ strokeDashoffset: `${2 * Math.PI * 50}` }}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - score / 100)}` }}
                    transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-fredoka font-bold text-3xl text-gray-900">{score}%</span>
                </div>
              </div>

              <p className="font-fredoka text-gray-600 mb-2">
                {correctCount} out of {totalQuestions} correct
              </p>

              {/* Tokens */}
              {!alreadyCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
                  className="bg-brand-yellow rounded-3xl p-3 flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">🪙</span>
                  <span className="font-fredoka font-bold text-xl text-gray-900">
                    +{tokensEarned || tokenReward} tokens earned!
                  </span>
                </motion.div>
              )}
              {alreadyCompleted && (
                <p className="font-fredoka text-xs text-gray-400 mt-2">Already completed — no extra tokens</p>
              )}

              {isPerfect && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="mt-3 bg-green-100 rounded-2xl p-2 flex items-center justify-center gap-1"
                >
                  <span className="text-lg">⭐</span>
                  <span className="font-fredoka font-semibold text-sm text-green-700">Perfect Score Bonus!</span>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex flex-col gap-3 w-full max-w-xs"
            >
              <Button
                variant="purple"
                size="lg"
                onClick={() => router.push(`/learn/${subject.toLowerCase()}`)}
                className="w-full"
              >
                More Lessons →
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setPhase('content')
                  setContentPage(0)
                  setQuestionIndex(0)
                  setCorrectCount(0)
                  setSelectedAnswer(null)
                  setIsCorrect(null)
                }}
                className="w-full gap-2"
              >
                <RotateCcw size={16} />
                Play Again
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
