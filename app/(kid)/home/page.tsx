import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { AvatarDisplay } from '@/components/kid/avatar-display'
import { TokenBadge } from '@/components/kid/token-badge'
import { SUBJECT_EMOJIS, SUBJECT_COLORS } from '@/types'
import type { AvatarConfig } from '@/types'
import { getStreakEmoji } from '@/lib/utils'

async function getKidHomeData(kidId: string) {
  return prisma.kid.findUnique({
    where: { id: kidId },
    include: {
      achievements: { include: { achievement: true }, take: 3, orderBy: { earnedAt: 'desc' } },
      progress: { where: { completed: true }, orderBy: { completedAt: 'desc' }, take: 5 },
    },
  })
}

export default async function HomePage() {
  const session = await getKidSession()
  if (!session) redirect('/')

  const kid = await getKidHomeData(session.kidId)
  if (!kid) redirect('/')

  const avatarConfig = kid.avatarConfig as unknown as AvatarConfig

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-brand-purple via-[#4f46e5] to-brand-blue pt-safe-top">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-fredoka text-white/70 text-lg">Hey there,</p>
              <h1 className="font-fredoka font-bold text-4xl text-white">{kid.name}! 🎉</h1>
            </div>
            <TokenBadge amount={kid.tokenBalance} size="md" className="mt-1" />
          </div>

          {/* Streak */}
          {kid.currentStreak > 0 && (
            <div className="flex items-center gap-2 mt-3 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 w-fit">
              <span className="text-xl">{getStreakEmoji(kid.currentStreak)}</span>
              <span className="font-fredoka font-semibold text-white">
                {kid.currentStreak} day streak!
              </span>
            </div>
          )}

          {/* Avatar centered */}
          <div className="flex justify-center mt-6">
            <AvatarDisplay config={avatarConfig} size="xl" animate />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Quick play */}
        <div>
          <h2 className="font-fredoka font-semibold text-xl text-gray-800 mb-3">🚀 Jump In!</h2>
          <div className="grid grid-cols-3 gap-3">
            {(['MATH', 'READING', 'SCIENCE'] as const).map((subject) => (
              <Link key={subject} href={`/learn/${subject.toLowerCase()}`}>
                <div className={`bg-gradient-to-br ${SUBJECT_COLORS[subject]} rounded-3xl p-4 text-center shadow-lg active:scale-95 transition-transform`}>
                  <div className="text-4xl mb-1">{SUBJECT_EMOJIS[subject]}</div>
                  <p className="font-fredoka font-semibold text-sm text-white capitalize">
                    {subject.charAt(0) + subject.slice(1).toLowerCase()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent achievements */}
        {kid.achievements.length > 0 && (
          <div>
            <h2 className="font-fredoka font-semibold text-xl text-gray-800 mb-3">🏆 Recent Badges</h2>
            <div className="flex gap-3">
              {kid.achievements.map(({ achievement, earnedAt }) => (
                <div
                  key={achievement.id}
                  className="flex-1 bg-white rounded-3xl p-3 text-center shadow-sm border-2 border-yellow-100"
                >
                  <div className="text-3xl mb-1">{achievement.iconEmoji}</div>
                  <p className="font-fredoka text-xs font-medium text-gray-700 leading-tight">{achievement.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/games">
            <div className="bg-gradient-to-br from-brand-orange to-yellow-400 rounded-4xl p-5 shadow-lg active:scale-95 transition-transform">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="font-fredoka font-bold text-lg text-white">Game Hub</h3>
              <p className="font-fredoka text-white/80 text-sm">Play mini-games!</p>
            </div>
          </Link>
          <Link href="/shop">
            <div className="bg-gradient-to-br from-brand-pink to-brand-purple rounded-4xl p-5 shadow-lg active:scale-95 transition-transform">
              <div className="text-4xl mb-2">🛍️</div>
              <h3 className="font-fredoka font-bold text-lg text-white">Shop</h3>
              <p className="font-fredoka text-white/80 text-sm">Spend tokens!</p>
            </div>
          </Link>
        </div>

        {/* Lessons completed */}
        {kid.progress.length > 0 && (
          <div>
            <h2 className="font-fredoka font-semibold text-xl text-gray-800 mb-3">📖 Recently Learned</h2>
            <div className="space-y-2">
              {kid.progress.slice(0, 3).map((p) => (
                <div key={p.id} className="bg-white rounded-3xl px-4 py-3 flex items-center gap-3 shadow-sm border-2 border-purple-50">
                  <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white text-sm">✓</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-fredoka font-medium text-gray-800 text-sm truncate">Lesson completed</p>
                    <p className="font-fredoka text-xs text-gray-400">+{p.tokensEarned} tokens</p>
                  </div>
                  {p.perfectScore && <span className="text-lg">⭐</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
