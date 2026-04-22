import { NextRequest, NextResponse } from 'next/server'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { awardTokens, calculateLessonReward, updateStreak } from '@/lib/tokens'
import { z } from 'zod'

const CompleteSchema = z.object({
  score: z.number().int().min(0).max(100),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getKidSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { lessonId } = await params
    const body = await req.json()
    const { score } = CompleteSchema.parse(body)

    const [lesson, kid, existingProgress] = await Promise.all([
      prisma.lesson.findUnique({ where: { id: lessonId } }),
      prisma.kid.findUnique({ where: { id: session.kidId }, select: { tokenBalance: true, currentStreak: true } }),
      prisma.lessonProgress.findUnique({
        where: { kidId_lessonId: { kidId: session.kidId, lessonId } },
      }),
    ])

    if (!lesson || !kid) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Idempotent — already completed, just return current balance
    if (existingProgress?.completed) {
      return NextResponse.json({ tokensEarned: 0, newBalance: kid.tokenBalance, alreadyCompleted: true })
    }

    const isPerfect = score === 100
    const reward = calculateLessonReward(score, kid.currentStreak)

    // Record progress
    await prisma.lessonProgress.upsert({
      where: { kidId_lessonId: { kidId: session.kidId, lessonId } },
      update: { completed: true, score, perfectScore: isPerfect, tokensEarned: reward.total, completedAt: new Date() },
      create: { kidId: session.kidId, lessonId, completed: true, score, perfectScore: isPerfect, tokensEarned: reward.total, completedAt: new Date() },
    })

    // Award base tokens
    await awardTokens({
      kidId: session.kidId,
      amount: reward.base,
      type: 'LESSON_COMPLETE',
      description: `Completed: ${lesson.title}`,
      referenceId: lessonId,
    })

    // Award perfect score bonus
    if (reward.perfect > 0) {
      await awardTokens({
        kidId: session.kidId,
        amount: reward.perfect,
        type: 'PERFECT_SCORE_BONUS',
        description: `Perfect score on: ${lesson.title}`,
        referenceId: lessonId,
      })
    }

    // Award streak bonus
    if (reward.streak > 0) {
      await awardTokens({
        kidId: session.kidId,
        amount: reward.streak,
        type: 'STREAK_BONUS',
        description: 'Streak bonus!',
        referenceId: lessonId,
      })
    }

    // Update streak
    await updateStreak(session.kidId)

    // Get updated balance
    const updatedKid = await prisma.kid.findUnique({
      where: { id: session.kidId },
      select: { tokenBalance: true },
    })

    return NextResponse.json({
      tokensEarned: reward.total,
      breakdown: reward,
      newBalance: updatedKid?.tokenBalance ?? 0,
      score,
      perfectScore: isPerfect,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('[lessons/complete]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
