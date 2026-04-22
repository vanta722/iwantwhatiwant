'use client'
export const dynamic = 'force-dynamic'

import { useKidStore } from '@/store/kid-store'
import { SpeedTapGame } from '@/components/kid/games/speed-tap'

export default function SpeedTapPage() {
  const updateTokenBalance = useKidStore((s) => s.updateTokenBalance)

  const handleEarnTokens = async (tokensEarned: number): Promise<{ newBalance: number }> => {
    const res = await fetch('/api/games/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'speed-tap', tokensEarned }),
    })
    const data = await res.json()
    if (data.newBalance !== undefined) updateTokenBalance(data.newBalance)
    return data
  }

  return <SpeedTapGame onEarnTokens={handleEarnTokens} />
}
