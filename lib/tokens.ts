import { prisma } from './prisma'
import { TOKEN_REWARDS } from '@/types'
import type { TransactionType } from '@prisma/client'

interface AwardTokensParams {
  kidId: string
  amount: number
  type: TransactionType
  description: string
  referenceId?: string
}

export async function awardTokens({ kidId, amount, type, description, referenceId }: AwardTokensParams) {
  const [transaction, kid] = await prisma.$transaction([
    prisma.tokenTransaction.create({
      data: { kidId, amount, type, description, referenceId },
    }),
    prisma.kid.update({
      where: { id: kidId },
      data: { tokenBalance: { increment: amount } },
    }),
  ])
  return { transaction, newBalance: kid.tokenBalance }
}

export async function spendTokens(kidId: string, amount: number, description: string, referenceId?: string) {
  const kid = await prisma.kid.findUnique({ where: { id: kidId }, select: { tokenBalance: true } })
  if (!kid || kid.tokenBalance < amount) {
    throw new Error('Insufficient tokens')
  }

  return prisma.$transaction([
    prisma.tokenTransaction.create({
      data: { kidId, amount: -amount, type: 'ITEM_PURCHASE', description, referenceId },
    }),
    prisma.kid.update({
      where: { id: kidId },
      data: { tokenBalance: { decrement: amount } },
    }),
  ])
}

export function calculateLessonReward(score: number, currentStreak: number) {
  const base = TOKEN_REWARDS.LESSON_COMPLETE
  const perfect = score === 100 ? TOKEN_REWARDS.PERFECT_SCORE : 0
  const streak = currentStreak >= 3 ? TOKEN_REWARDS.STREAK_BONUS : 0
  return { base, perfect, streak, total: base + perfect + streak }
}

export async function updateStreak(kidId: string) {
  const kid = await prisma.kid.findUnique({
    where: { id: kidId },
    select: { currentStreak: true, lastActivityDate: true },
  })
  if (!kid) return

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let newStreak = kid.currentStreak

  if (kid.lastActivityDate) {
    const last = new Date(kid.lastActivityDate)
    const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate())
    const diffDays = Math.round((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return kid.currentStreak // already counted today
    if (diffDays === 1) newStreak += 1
    else newStreak = 1
  } else {
    newStreak = 1
  }

  await prisma.kid.update({
    where: { id: kidId },
    data: { currentStreak: newStreak, lastActivityDate: now },
  })

  return newStreak
}
