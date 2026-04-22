import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import type { Subject, Lesson, AgeTier } from '@prisma/client'
import { SUBJECT_EMOJIS, SUBJECT_LABELS, SUBJECT_COLORS } from '@/types'
import { GenerateLessonButton } from './generate-lesson-button'

const VALID_SUBJECTS: Subject[] = ['MATH', 'READING', 'SCIENCE']

function difficultyStars(d: number) {
  return '⭐'.repeat(d) + '☆'.repeat(5 - d)
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>
}) {
  const { subject } = await params
  const subjectKey = subject.toUpperCase() as Subject

  if (!VALID_SUBJECTS.includes(subjectKey)) notFound()

  const session = await getKidSession()
  if (!session) redirect('/')

  const kid = await prisma.kid.findUnique({
    where: { id: session.kidId },
    select: { ageTier: true },
  })
  if (!kid) redirect('/')

  const [lessons, progress] = await Promise.all([
    prisma.lesson.findMany({
      where: { subject: subjectKey, ageTier: kid.ageTier, safetyStatus: 'APPROVED' },
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.lessonProgress.findMany({
      where: { kidId: session.kidId },
      select: { lessonId: true, completed: true, score: true, perfectScore: true },
    }),
  ])

  const progressMap = new Map(progress.map((p) => [p.lessonId, p]))

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${SUBJECT_COLORS[subjectKey]} rounded-4xl p-6 text-white mb-6`}>
        <Link href="/learn" className="text-white/70 font-fredoka text-sm mb-2 block">
          ← All Subjects
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-5xl">{SUBJECT_EMOJIS[subjectKey]}</span>
          <div>
            <h1 className="font-fredoka font-bold text-3xl">{SUBJECT_LABELS[subjectKey]}</h1>
            <p className="font-fredoka text-white/80">{lessons.length} lessons available</p>
          </div>
        </div>
      </div>

      {/* Generate button */}
      <div className="mb-4">
        <GenerateLessonButton subject={subjectKey} ageTier={kid.ageTier} />
      </div>

      {/* Lesson list */}
      {lessons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-4xl border-2 border-dashed border-purple-200">
          <div className="text-5xl mb-3">📝</div>
          <h3 className="font-fredoka font-semibold text-lg text-gray-700 mb-1">No lessons yet!</h3>
          <p className="font-fredoka text-gray-500 text-sm">Generate your first lesson above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const p = progressMap.get(lesson.id)
            const done = p?.completed ?? false
            const perfect = p?.perfectScore ?? false

            return (
              <Link key={lesson.id} href={`/learn/${subject}/lesson/${lesson.id}`}>
                <div className={`bg-white rounded-4xl p-5 shadow-sm border-2 transition-all active:scale-98 ${
                  done ? 'border-brand-green/40 bg-green-50' : 'border-purple-100 hover:border-brand-purple/40'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                      done ? 'bg-brand-green text-white' : 'bg-purple-100'
                    }`}>
                      {done ? (perfect ? '⭐' : '✓') : SUBJECT_EMOJIS[subjectKey]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-fredoka font-semibold text-base text-gray-900 leading-tight">
                        {lesson.title}
                      </h3>
                      <p className="font-fredoka text-xs text-gray-500 mt-0.5">
                        {difficultyStars(lesson.difficulty)} · +{lesson.tokenReward} tokens
                        {done && p && p.score !== null && ` · Score: ${p.score}%`}
                      </p>
                    </div>
                    <div className="text-gray-400 text-lg">→</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
