'use client'

import { motion } from 'framer-motion'

interface Game {
  id: string
  title: string
  description: string
  emoji: string
  subject: string
  tokenCost: number
  gradient: string
  comingSoon: boolean
}

export function GameCard({ game }: { game: Game }) {
  return (
    <motion.div
      whileTap={!game.comingSoon ? { scale: 0.97 } : undefined}
      className={`bg-gradient-to-r ${game.gradient} rounded-4xl p-6 shadow-lg relative overflow-hidden ${
        game.comingSoon ? 'opacity-70' : 'cursor-pointer'
      }`}
    >
      {game.comingSoon && (
        <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="font-fredoka font-semibold text-white text-xs">Coming Soon</span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <motion.div
          animate={!game.comingSoon ? { rotate: [0, -10, 10, 0] } : undefined}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-6xl"
        >
          {game.emoji}
        </motion.div>
        <div>
          <h2 className="font-fredoka font-bold text-2xl text-white">{game.title}</h2>
          <p className="font-fredoka text-white/80 text-sm">{game.description}</p>
          {game.tokenCost > 0 && (
            <p className="font-fredoka text-white/60 text-xs mt-1">🪙 {game.tokenCost} tokens to play</p>
          )}
        </div>
      </div>

      {!game.comingSoon && (
        <motion.div
          className="mt-4 bg-white/25 backdrop-blur-sm rounded-3xl py-3 text-center"
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.35)' }}
        >
          <span className="font-fredoka font-bold text-white text-lg">🎮 Play Now!</span>
        </motion.div>
      )}
    </motion.div>
  )
}
