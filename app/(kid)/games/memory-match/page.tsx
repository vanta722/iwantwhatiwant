'use client'
export const dynamic = 'force-dynamic'

import { useKidStore } from '@/store/kid-store'
import { MemoryMatchGame } from '@/components/kid/games/memory-match'

export default function MemoryMatchPage() {
  const updateTokenBalance = useKidStore((s) => s.updateTokenBalance)

  const handleEarnTokens = async (tokensEarned: number): Promise<{ newBalance: number }> => {
    const res = await fetch('/api/games/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'memory-match', tokensEarned }),
    })
    const data = await res.json()
    if (data.newBalance !== undefined) updateTokenBalance(data.newBalance)
    return data
  }

  return <MemoryMatchGame onEarnTokens={handleEarnTokens} />
}
