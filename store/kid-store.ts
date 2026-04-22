'use client'

import { create } from 'zustand'
import type { KidContext, AvatarConfig } from '@/types'
import type { AgeTier } from '@prisma/client'

interface KidState {
  kid: KidContext | null
  setKid: (kid: KidContext) => void
  updateTokenBalance: (newBalance: number) => void
  clearKid: () => void
}

export const useKidStore = create<KidState>((set) => ({
  kid: null,
  setKid: (kid) => set({ kid }),
  updateTokenBalance: (newBalance) =>
    set((state) => ({
      kid: state.kid ? { ...state.kid, tokenBalance: newBalance } : null,
    })),
  clearKid: () => set({ kid: null }),
}))
