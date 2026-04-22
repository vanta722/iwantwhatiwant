'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BookOpen, Gamepad2, Star, Shield } from 'lucide-react'

const FLOATING_EMOJIS = ['🌟', '🎮', '📚', '🔢', '🔬', '🏆', '🎯', '💡', '🌈', '🦄']

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-purple via-brand-blue to-brand-pink overflow-hidden relative">
      {/* Floating background emojis */}
      {FLOATING_EMOJIS.map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-20 select-none pointer-events-none"
          style={{
            left: `${(i * 10 + 5) % 95}%`,
            top: `${(i * 13 + 8) % 85}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-8xl mb-4"
        >
          🌟
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-fredoka font-bold text-5xl md:text-7xl text-white mb-3 leading-tight"
        >
          IWantWhat
          <br />
          <span className="text-brand-yellow">IWant</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="font-fredoka text-xl md:text-2xl text-white/80 mb-10 max-w-md"
        >
          The epic world where kids learn through adventure 🚀
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            { icon: BookOpen, text: 'AI-Powered Lessons' },
            { icon: Gamepad2, text: 'Epic Games' },
            { icon: Star, text: 'Earn Tokens' },
            { icon: Shield, text: 'Parent Approved' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
              <Icon size={16} className="text-brand-yellow" />
              <span className="font-fredoka text-sm text-white font-medium">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <Link href="/sign-up">
            <Button variant="yellow" size="xl" className="w-full text-2xl font-bold">
              👋 I&apos;m a Parent
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="ghost" size="lg" className="w-full text-lg border-2 border-white/40">
              Already have an account? Sign in
            </Button>
          </Link>

          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-3xl p-4 text-left">
            <p className="font-fredoka text-white/80 text-sm font-medium mb-1">🎮 For Kids</p>
            <p className="font-fredoka text-white/70 text-xs">
              Ask your parent for your special family link, or visit{' '}
              <span className="text-brand-yellow font-semibold">iwantwhatiwant.co/play/[your-code]</span>
            </p>
          </div>
        </motion.div>

        {/* COPPA badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 flex items-center gap-2 text-white/50 text-xs font-fredoka"
        >
          <Shield size={12} />
          <span>COPPA compliant · No ads · No chat · Parent controlled</span>
        </motion.div>
      </div>
    </div>
  )
}
