import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { KidCard } from '@/components/parent/kid-card'
import { Button } from '@/components/ui/button'
import { Copy, Plus, ExternalLink } from 'lucide-react'
import { CopyFamilyLink } from './copy-family-link'

async function getParentData(clerkId: string) {
  return prisma.parent.findUnique({
    where: { clerkId },
    include: {
      kids: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const parent = await getParentData(userId)
  if (!parent) redirect('/sign-in')

  const familyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/play/${parent.familyCode}`

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-fredoka font-bold text-3xl text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="font-fredoka text-gray-500 mt-1">Manage your kids&apos; learning adventures</p>
      </div>

      {/* Family Portal Link */}
      <div className="bg-gradient-to-r from-brand-purple to-brand-blue rounded-4xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="font-fredoka font-semibold text-lg mb-1">🎮 Kids Play Here</h2>
            <p className="font-fredoka text-white/80 text-sm mb-3">
              Share this link with your kids so they can log in and play!
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 font-mono text-sm text-white/90 truncate">
              /play/{parent.familyCode}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <CopyFamilyLink url={familyUrl} />
          <Link href={`/play/${parent.familyCode}`} target="_blank">
            <Button variant="ghost" size="sm" className="gap-2">
              <ExternalLink size={16} />
              Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Kids Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-fredoka font-semibold text-xl text-gray-900">
            Your Kids ({parent.kids.length})
          </h2>
          <Link href="/dashboard/kids/new">
            <Button variant="purple" size="sm" className="gap-2">
              <Plus size={16} />
              Add Kid
            </Button>
          </Link>
        </div>

        {parent.kids.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-4xl border-2 border-dashed border-purple-200">
            <div className="text-6xl mb-4">👶</div>
            <h3 className="font-fredoka font-semibold text-xl text-gray-700 mb-2">
              No kids yet!
            </h3>
            <p className="font-fredoka text-gray-500 mb-6">
              Add your first kid to get started
            </p>
            <Link href="/dashboard/kids/new">
              <Button variant="purple" size="lg">
                <Plus size={20} />
                Create Kid Profile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parent.kids.map((kid) => (
              <KidCard key={kid.id} kid={kid} />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {parent.kids.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Kids', value: parent.kids.length, emoji: '👨‍👩‍👧‍👦' },
            { label: 'Active Streaks', value: parent.kids.filter(k => k.currentStreak > 0).length, emoji: '🔥' },
            { label: 'Total Tokens', value: parent.kids.reduce((sum, k) => sum + k.tokenBalance, 0).toLocaleString(), emoji: '🪙' },
            { label: 'Age Groups', value: new Set(parent.kids.map(k => k.ageTier)).size, emoji: '🎓' },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="bg-white rounded-3xl p-4 shadow-sm border-2 border-purple-100 text-center">
              <div className="text-3xl mb-1">{emoji}</div>
              <div className="font-fredoka font-bold text-2xl text-gray-900">{value}</div>
              <div className="font-fredoka text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
