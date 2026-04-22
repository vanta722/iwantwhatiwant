import { notFound, redirect } from 'next/navigation'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { LessonPlayer } from '@/components/kid/lesson-player'
import type { LessonContent, Question } from '@/types'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ subject: string; lessonId: string }>
}) {
  const { lessonId } = await params

  const session = await getKidSession()
  if (!session) redirect('/')

  const [lesson, progress] = await Promise.all([
    prisma.lesson.findUnique({ where: { id: lessonId, safetyStatus: 'APPROVED' } }),
    prisma.lessonProgress.findUnique({
      where: { kidId_lessonId: { kidId: session.kidId, lessonId } },
    }),
  ])

  if (!lesson) notFound()

  // Update view count
  await prisma.lesson.update({
    where: { id: lessonId },
    data: { timesPlayed: { increment: 1 } },
  })

  return (
    <LessonPlayer
      lessonId={lesson.id}
      title={lesson.title}
      subject={lesson.subject}
      content={lesson.content as unknown as LessonContent}
      questions={lesson.questions as unknown as Question[]}
      tokenReward={lesson.tokenReward}
      alreadyCompleted={progress?.completed ?? false}
    />
  )
}
