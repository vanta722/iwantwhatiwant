import { getKidSession } from '@/lib/kid-session'
import { redirect } from 'next/navigation'
import { GameCard } from './game-card'

const GAMES = [
  {
    id: 'math-blaster',
    title: 'Math Blaster',
    description: 'Shoot the correct answers before time runs out!',
    emoji: '🚀',
    subject: 'MATH',
    tokenCost: 0,
    gradient: 'from-brand-purple to-brand-blue',
    comingSoon: false,
  },
  {
    id: 'word-wizard',
    title: 'Word Wizard',
    description: 'Spell words correctly to cast magic spells!',
    emoji: '🪄',
    subject: 'READING',
    tokenCost: 0,
    gradient: 'from-brand-orange to-yellow-400',
    comingSoon: true,
  },
  {
    id: 'science-lab',
    title: 'Lab Explosion',
    description: 'Mix chemicals and discover what happens!',
    emoji: '🧪',
    subject: 'SCIENCE',
    tokenCost: 0,
    gradient: 'from-brand-green to-brand-sky',
    comingSoon: true,
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
        <p className="font-fredoka text-white/80">Play games and level up your skills!</p>
      </div>

      {/* Games grid */}
      <div className="space-y-4">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {/* Coming soon teaser */}
      <div className="mt-8 text-center">
        <p className="font-fredoka text-gray-500">🔮 More games coming soon...</p>
        <p className="font-fredoka text-xs text-gray-400 mt-1">Complete lessons to unlock new adventures!</p>
      </div>
    </div>
  )
}
