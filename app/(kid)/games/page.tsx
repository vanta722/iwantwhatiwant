export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { getKidSession } from '@/lib/kid-session'
import { redirect } from 'next/navigation'

const GAMES = [
  {
    id: 'memory-match',
    href: '/games/memory-match',
    title: 'Memory Match',
    description: 'Flip cards and find all the pairs before time runs out!',
    emoji: '🃏',
    gradient: 'from-brand-purple to-brand-blue',
    tag: 'Card Game',
    live: true,
  },
  {
    id: 'speed-tap',
    href: '/games/speed-tap',
    title: 'Speed Tap',
    description: 'Tap the targets before they vanish — how fast are you?',
    emoji: '⚡',
    gradient: 'from-brand-orange to-brand-pink',
    tag: 'Reaction',
    live: true,
  },
  {
    id: 'word-wizard',
    href: '#',
    title: 'Word Wizard',
    description: 'Spell words correctly to cast powerful magic spells!',
    emoji: '🪄',
    gradient: 'from-brand-green to-brand-sky',
    tag: 'Coming Soon',
    live: false,
  },
]

export default async function GamesPage() {
  const session = await getKidSession()
  if (!session) redirect('/')

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-orange to-yellow-400 rounded-4xl p-6 text-white mb-6">
        <h1 className="font-fredoka font-bold text-3xl mb-1">🎮 Game Hub</h1>
        <p className="font-fredoka text-white/80">Play games and earn tokens!</p>
      </div>

      {/* Live games */}
      <div className="space-y-4 mb-6">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            href={game.live ? game.href : '#'}
            className={game.live ? '' : 'pointer-events-none opacity-60'}
          >
            <div className={`bg-gradient-to-r ${game.gradient} rounded-4xl p-6 shadow-lg relative overflow-hidden group`}>
              {!game.live && (
                <div className="absolute top-4 right-4 bg-black/25 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="font-fredoka font-semibold text-white text-xs">Coming Soon</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="text-6xl">{game.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="font-fredoka font-bold text-2xl text-white">{game.title}</h2>
                    {game.live && (
                      <span className="bg-white/25 text-white font-fredoka text-xs px-2 py-0.5 rounded-full">
                        {game.tag}
                      </span>
                    )}
                  </div>
                  <p className="font-fredoka text-white/80 text-sm leading-snug">{game.description}</p>
                </div>
                {game.live && <div className="text-white/60 text-3xl group-hover:translate-x-1 transition-transform">→</div>}
              </div>

              {game.live && (
                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-3xl py-3 text-center">
                  <span className="font-fredoka font-bold text-white text-lg">Play Now! 🎮</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center font-fredoka text-gray-400 text-sm">🔮 More games coming soon — keep earning tokens!</p>
    </div>
  )
}
