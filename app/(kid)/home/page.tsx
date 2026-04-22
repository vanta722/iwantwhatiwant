import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getKidSession } from '@/lib/kid-session'
import { AvatarDisplay } from '@/components/kid/avatar-display'
import { TokenBadge } from '@/components/kid/token-badge'
import { SUBJECT_EMOJIS, SUBJECT_COLORS } from '@/types'
import type { AvatarConfig } from '@/types'

const DEMO_KID = {
  id: 'demo-kid-001',
  name: 'Explorer',
  tokenBalance: 150,
  ageTier: 'JUNIOR',
  currentStreak: 3,
  avatarConfig: { baseColor: '#7C3AED', eyeType: 'happy', accessory: null, pet: 'robot', frame: 'rainbow', effect: 'sparkle', background: 'galaxy' } as AvatarConfig,
}

const SUBJECTS = ['MATH', 'READING', 'SCIENCE'] as const

export default async function HomePage() {
  const session = await getKidSession()
  if (!session) redirect('/')

  const kid = DEMO_KID

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-brand-purple via-[#4f46e5] to-brand-blue pt-safe-top">
        <div className="max-w-lg mx-auto px-5 pt-6 pb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-fredoka text-white/70 text-lg">Hey there,</p>
              <h1 className="font-fredoka font-bold text-4xl text-white">{kid.name}! 🎉</h1>
            </div>
            <TokenBadge amount={kid.tokenBalance} size="md" className="mt-1" />
          </div>
          {kid.currentStreak > 0 && (
            <div className="flex items-center gap-2 mt-3 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 w-fit">
              <span className="text-xl">🔥</span>
              <span className="font-fredoka font-semibold text-white">
                {kid.currentStreak} day streak!
              </span>
            </div>
          )}
          <div className="mt-5 flex justify-center">
            <AvatarDisplay config={kid.avatarConfig} size="lg" animate />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        <section>
          <h2 className="font-fredoka font-bold text-2xl text-gray-800 mb-3">📚 Keep Learning</h2>
          <div className="grid grid-cols-3 gap-3">
            {SUBJECTS.map((subject) => (
              <Link
                key={subject}
                href={`/learn/${subject}`}
                className={`${SUBJECT_COLORS[subject]} rounded-3xl p-4 text-center shadow-md active:scale-95 transition-transform`}
              >
                <div className="text-3xl mb-1">{SUBJECT_EMOJIS[subject]}</div>
                <p className="font-fredoka font-semibold text-white capitalize text-sm">{subject}</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-fredoka font-bold text-2xl text-gray-800 mb-3">🎮 Play Games</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/games/memory-match" className="bg-gradient-to-br from-pink-400 to-rose-500 rounded-3xl p-5 shadow-md active:scale-95 transition-transform">
              <div className="text-3xl mb-2">🃏</div>
              <p className="font-fredoka font-bold text-white text-lg">Memory Match</p>
              <p className="font-fredoka text-white/80 text-sm">Flip and match cards</p>
            </Link>
            <Link href="/games/speed-tap" className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-3xl p-5 shadow-md active:scale-95 transition-transform">
              <div className="text-3xl mb-2">⚡</div>
              <p className="font-fredoka font-bold text-white text-lg">Speed Tap</p>
              <p className="font-fredoka text-white/80 text-sm">Tap fast, earn tokens</p>
            </Link>
          </div>
        </section>

        <Link href="/shop" className="block bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-5 shadow-md active:scale-95 transition-transform">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🛍️</span>
            <div>
              <p className="font-fredoka font-bold text-white text-xl">Visit the Shop</p>
              <p className="font-fredoka text-white/80">Spend your {kid.tokenBalance} tokens!</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
