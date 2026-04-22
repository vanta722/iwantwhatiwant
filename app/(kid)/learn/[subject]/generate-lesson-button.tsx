'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import type { Subject, AgeTier } from '@prisma/client'

export function GenerateLessonButton({ subject, ageTier }: { subject: Subject; ageTier: AgeTier }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, ageTier }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const { lessonId } = await res.json()
      router.push(`/learn/${subject.toLowerCase()}/lesson/${lessonId}`)
    } catch {
      setError('Could not generate lesson. Try again!')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          variant="purple"
          size="md"
          onClick={generate}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              ✨
            </motion.span>
          ) : (
            <Sparkles size={18} />
          )}
          {loading ? 'AI is creating your lesson...' : 'Generate New Lesson with AI'}
        </Button>
      </motion.div>
      {error && <p className="text-red-500 font-fredoka text-xs text-center">{error}</p>}
    </div>
  )
}
