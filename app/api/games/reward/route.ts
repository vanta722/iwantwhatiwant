import { NextRequest, NextResponse } from 'next/server'
import { getKidSession } from '@/lib/kid-session'
import { awardTokens } from '@/lib/tokens'
import { z } from 'zod'

const VALID_GAMES = ['memory-match', 'speed-tap'] as const
const MAX_REWARDS: Record<string, number> = {
  'memory-match': 50,
  'speed-tap':    30,
}

const RewardSchema = z.object({
  gameId: z.enum(VALID_GAMES),
  tokensEarned: z.number().int().min(1).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getKidSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { gameId, tokensEarned } = RewardSchema.parse(body)

    // Cap to server-side max to prevent tampering
    const capped = Math.min(tokensEarned, MAX_REWARDS[gameId] ?? 30)

    const { newBalance } = await awardTokens({
      kidId: session.kidId,
      amount: capped,
      type: 'ACHIEVEMENT_BONUS',
      description: `Won game: ${gameId}`,
      referenceId: gameId,
    })

    return NextResponse.json({ tokensEarned: capped, newBalance })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    console.error('[games/reward]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
