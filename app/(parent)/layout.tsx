import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { generateFamilyCode } from '@/lib/utils'

async function ensureParent(clerkId: string, email: string, name?: string) {
  return prisma.parent.upsert({
    where: { clerkId },
    update: {},
    create: {
      clerkId,
      email,
      name: name ?? email.split('@')[0],
      familyCode: generateFamilyCode(),
    },
  })
}

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  if (!user) redirect('/sign-in')

  await ensureParent(
    userId,
    user.emailAddresses[0]?.emailAddress ?? '',
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || undefined
  )

  return (
    <div className="min-h-screen bg-[#f0f4ff]">
      {/* Parent nav */}
      <header className="bg-white border-b-2 border-purple-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🌟</span>
            <span className="font-fredoka font-bold text-xl text-brand-purple">IWWIW</span>
            <span className="font-fredoka text-sm text-gray-400 hidden sm:block">Parent Dashboard</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
