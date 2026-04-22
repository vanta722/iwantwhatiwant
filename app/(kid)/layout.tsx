import { redirect } from 'next/navigation'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { KidNavBar } from '@/components/kid/nav-bar'
import { KidStoreInitializer } from './kid-store-initializer'
import type { AvatarConfig } from '@/types'

export default async function KidLayout({ children }: { children: React.ReactNode }) {
  const session = await getKidSession()
  if (!session) redirect('/')

  const kid = await prisma.kid.findUnique({
    where: { id: session.kidId },
    select: {
      id: true,
      name: true,
      tokenBalance: true,
      ageTier: true,
      avatarConfig: true,
      currentStreak: true,
      parentId: true,
    },
  })

  if (!kid) redirect('/')

  return (
    <div className="min-h-screen bg-[#f0f4ff] pb-24">
      <KidStoreInitializer
        kid={{
          kidId: kid.id,
          parentId: kid.parentId,
          familyCode: session.familyCode,
          name: kid.name,
          tokenBalance: kid.tokenBalance,
          ageTier: kid.ageTier,
          avatarConfig: kid.avatarConfig as unknown as AvatarConfig,
          currentStreak: kid.currentStreak,
        }}
      />
      {children}
      <KidNavBar />
    </div>
  )
}
