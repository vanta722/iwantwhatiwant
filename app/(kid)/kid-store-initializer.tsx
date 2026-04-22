'use client'

import { useEffect } from 'react'
import { useKidStore } from '@/store/kid-store'
import type { KidContext } from '@/types'

export function KidStoreInitializer({ kid }: { kid: KidContext }) {
  const setKid = useKidStore((s) => s.setKid)
  useEffect(() => {
    setKid(kid)
  }, [kid, setKid])
  return null
}
