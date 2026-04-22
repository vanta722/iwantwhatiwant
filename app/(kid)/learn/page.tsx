import Link from 'next/link'
import { getKidSession } from '@/lib/kid-session'
import { redirect } from 'next/navigation'
import { SUBJECT_EMOJIS, SUBJECT_COLORS, SUBJECT_LABELS } from '@/types'

const SUBJECTS = ['MATH', 'READING', 'SCIENCE'] as const

const SUBJECT_DESCRIPTIONS = {
  MATH: 'Numbers, shapes, and puzzles!',
  READING: 'Stories, words, and adventures!',
  SCIENCE: 'Nature, space, and experiments!',
}

export default async function LearnPage() {
  const session = await getKidSession()
  if (!session) redirect('/')

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-purple to-brand-blue rounded-4xl p-6 text-white mb-6">
        <h1 className="font-fredoka font-bold text-3xl mb-1">What do you want to learn? 🧠</h1>
        <p className="font-fredoka text-white/80">Pick a subject and start your quest!</p>
      </div>

      {/* Subject cards */}
      <div className="space-y-4">
        {SUBJECTS.map((subject) => (
          <Link key={subject} href={`/learn/${subject.toLowerCase()}`}>
            <div className={`bg-gradient-to-r ${SUBJECT_COLORS[subject]} rounded-4xl p-6 shadow-lg active:scale-98 transition-transform hover:shadow-xl`}>
              <div className="flex items-center gap-4">
                <div className="text-6xl">{SUBJECT_EMOJIS[subject]}</div>
                <div>
                  <h2 className="font-fredoka font-bold text-2xl text-white">{SUBJECT_LABELS[subject]}</h2>
                  <p className="font-fredoka text-white/80">{SUBJECT_DESCRIPTIONS[subject]}</p>
                </div>
                <div className="ml-auto text-white/60 text-3xl">→</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Encouragement */}
      <div className="mt-6 bg-brand-yellow/20 border-2 border-brand-yellow rounded-3xl p-4 text-center">
        <p className="font-fredoka font-semibold text-gray-800">
          🌟 Complete a lesson to earn <span className="text-brand-purple">10–60 tokens!</span>
        </p>
      </div>
    </div>
  )
}
