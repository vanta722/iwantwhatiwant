import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const MODEL = 'claude-sonnet-4-6'

// ── Shop items ─────────────────────────────────────────────────────────────────

const SHOP_ITEMS = [
  // ── Accessories (80–200 tokens) ──────────────────────────────────────────
  { name: 'Party Hat',    description: 'Every day is a celebration!', type: 'AVATAR_ACCESSORY', tokenCost:  60, config: { emoji: '🎉', value: 'hat' } },
  { name: 'Cool Shades',  description: 'Lookin\' too cool for school.',  type: 'AVATAR_ACCESSORY', tokenCost:  80, config: { emoji: '😎', value: 'glasses' } },
  { name: 'Lucky Bow',    description: 'Tie it on for good luck!',     type: 'AVATAR_ACCESSORY', tokenCost:  90, config: { emoji: '🎀', value: 'bow' } },
  { name: 'Royal Crown',  description: 'Wear your crown with pride!',  type: 'AVATAR_ACCESSORY', tokenCost: 150, config: { emoji: '👑', value: 'crown' } },

  // ── Pets (150–350 tokens) ────────────────────────────────────────────────
  { name: 'Kitty Pal',    description: 'A purring companion!',         type: 'PET', tokenCost: 150, config: { emoji: '🐱', value: 'cat' } },
  { name: 'Puppy Pal',    description: 'Loyal and always happy!',      type: 'PET', tokenCost: 150, config: { emoji: '🐶', value: 'dog' } },
  { name: 'Robot Buddy',  description: 'Beep boop — your robot pal!', type: 'PET', tokenCost: 200, config: { emoji: '🤖', value: 'robot' } },
  { name: 'Unicorn BFF',  description: 'Magical and full of rainbows!', type: 'PET', tokenCost: 250, config: { emoji: '🦄', value: 'unicorn' } },
  { name: 'Fire Dragon',  description: 'A legendary beast is yours!', type: 'PET', tokenCost: 350, config: { emoji: '🐲', value: 'dragon' } },

  // ── Frames (100–400 tokens) ──────────────────────────────────────────────
  { name: 'Gold Frame',    description: 'Shine bright like gold!',      type: 'AVATAR_FRAME', tokenCost: 100, config: { emoji: '🥇', value: 'gold' } },
  { name: 'Ice Frame',     description: 'Cool as ice!',                 type: 'AVATAR_FRAME', tokenCost: 150, config: { emoji: '❄️', value: 'ice' } },
  { name: 'Neon Frame',    description: 'Electric green glow!',         type: 'AVATAR_FRAME', tokenCost: 200, config: { emoji: '💚', value: 'neon' } },
  { name: 'Galaxy Frame',  description: 'Cosmic purple power!',         type: 'AVATAR_FRAME', tokenCost: 250, config: { emoji: '🔮', value: 'galaxy' } },
  { name: 'Fire Frame',    description: 'Burn bright! 🔥',              type: 'AVATAR_FRAME', tokenCost: 300, config: { emoji: '🔥', value: 'fire' } },
  { name: 'Rainbow Frame', description: 'Every color of the rainbow!', type: 'AVATAR_FRAME', tokenCost: 400, config: { emoji: '🌈', value: 'rainbow' } },

  // ── Effects (150–500 tokens) ─────────────────────────────────────────────
  { name: 'Sparkle FX',  description: 'Shimmer and shine!',            type: 'AVATAR_EFFECT', tokenCost: 150, config: { emoji: '✨', value: 'sparkle' } },
  { name: 'Glow FX',     description: 'Pulse with a soft glow.',       type: 'AVATAR_EFFECT', tokenCost: 200, config: { emoji: '💫', value: 'glow' } },
  { name: 'Stars FX',    description: 'Orbit with floating stars!',    type: 'AVATAR_EFFECT', tokenCost: 350, config: { emoji: '🌟', value: 'stars' } },

  // ── Backgrounds (200–600 tokens) ────────────────────────────────────────
  { name: 'Forest World',  description: 'Deep in an emerald forest!',  type: 'BACKGROUND', tokenCost: 200, config: { emoji: '🌲', value: 'forest' } },
  { name: 'Ocean World',   description: 'Dive into the deep blue!',    type: 'BACKGROUND', tokenCost: 200, config: { emoji: '🌊', value: 'ocean' } },
  { name: 'Sunset World',  description: 'Golden hour every hour!',     type: 'BACKGROUND', tokenCost: 250, config: { emoji: '🌅', value: 'sunset' } },
  { name: 'Candy World',   description: 'Everything is candy here!',   type: 'BACKGROUND', tokenCost: 300, config: { emoji: '🍭', value: 'candy' } },
  { name: 'Galaxy World',  description: 'Journey through the stars!',  type: 'BACKGROUND', tokenCost: 500, config: { emoji: '🌌', value: 'galaxy' } },
] as const

// ── Achievements ───────────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  { key: 'first_lesson',    name: 'First Steps!',    description: 'Complete your first lesson',            iconEmoji: '🎉', tokenReward: 20  },
  { key: 'perfect_score',   name: 'Brainiac!',       description: 'Get a perfect score on any lesson',     iconEmoji: '🧠', tokenReward: 25  },
  { key: 'streak_3',        name: 'On Fire!',        description: 'Reach a 3-day learning streak',         iconEmoji: '🔥', tokenReward: 15  },
  { key: 'streak_7',        name: 'Week Warrior!',   description: 'Reach a 7-day learning streak',         iconEmoji: '⚡', tokenReward: 50  },
  { key: 'streak_30',       name: 'Unstoppable!',    description: 'Reach a 30-day learning streak',        iconEmoji: '🏅', tokenReward: 200 },
  { key: 'math_master',     name: 'Math Master',     description: 'Complete 5 math lessons',               iconEmoji: '🔢', tokenReward: 30  },
  { key: 'bookworm',        name: 'Bookworm',        description: 'Complete 5 reading lessons',             iconEmoji: '📚', tokenReward: 30  },
  { key: 'scientist',       name: 'Scientist',       description: 'Complete 5 science lessons',             iconEmoji: '🔬', tokenReward: 30  },
  { key: 'memory_champ',    name: 'Memory Champ!',   description: 'Win a Memory Match game',               iconEmoji: '🃏', tokenReward: 20  },
  { key: 'speed_demon',     name: 'Speed Demon!',    description: 'Score 15+ in Speed Tap',                iconEmoji: '⚡', tokenReward: 20  },
  { key: 'token_100',       name: 'Token Collector', description: 'Earn 100 tokens total',                 iconEmoji: '🪙', tokenReward: 0   },
  { key: 'token_500',       name: 'Token Hoarder!',  description: 'Earn 500 tokens total',                 iconEmoji: '💰', tokenReward: 50  },
  { key: 'shopaholic',      name: 'Shopaholic!',     description: 'Purchase your first item',              iconEmoji: '🛍️', tokenReward: 10  },
]

// ── Lesson specs ───────────────────────────────────────────────────────────────

interface LessonSpec {
  subject: 'MATH' | 'READING' | 'SCIENCE'
  ageTier: 'AGES_4_6' | 'AGES_7_9' | 'AGES_10_12'
  topic: string
  difficulty: number
}

const SEED_SPECS: LessonSpec[] = [
  { subject: 'MATH',    ageTier: 'AGES_4_6',   topic: 'counting to 10',              difficulty: 1 },
  { subject: 'MATH',    ageTier: 'AGES_4_6',   topic: 'basic shapes',                difficulty: 1 },
  { subject: 'MATH',    ageTier: 'AGES_7_9',   topic: 'addition and subtraction',    difficulty: 2 },
  { subject: 'MATH',    ageTier: 'AGES_7_9',   topic: 'multiplication basics',       difficulty: 2 },
  { subject: 'MATH',    ageTier: 'AGES_10_12', topic: 'fractions',                   difficulty: 3 },
  { subject: 'MATH',    ageTier: 'AGES_10_12', topic: 'long division',               difficulty: 4 },
  { subject: 'READING', ageTier: 'AGES_4_6',   topic: 'vowels and consonants',       difficulty: 1 },
  { subject: 'READING', ageTier: 'AGES_4_6',   topic: 'rhyming words',               difficulty: 1 },
  { subject: 'READING', ageTier: 'AGES_7_9',   topic: 'compound words',              difficulty: 2 },
  { subject: 'READING', ageTier: 'AGES_7_9',   topic: 'antonyms and synonyms',       difficulty: 2 },
  { subject: 'READING', ageTier: 'AGES_10_12', topic: 'prefixes and suffixes',       difficulty: 3 },
  { subject: 'READING', ageTier: 'AGES_10_12', topic: 'context clues',              difficulty: 3 },
  { subject: 'SCIENCE', ageTier: 'AGES_4_6',   topic: 'animals and their sounds',   difficulty: 1 },
  { subject: 'SCIENCE', ageTier: 'AGES_4_6',   topic: 'plants and sunlight',        difficulty: 1 },
  { subject: 'SCIENCE', ageTier: 'AGES_7_9',   topic: 'the water cycle',            difficulty: 2 },
  { subject: 'SCIENCE', ageTier: 'AGES_7_9',   topic: 'states of matter',           difficulty: 2 },
  { subject: 'SCIENCE', ageTier: 'AGES_10_12', topic: 'the solar system',           difficulty: 3 },
  { subject: 'SCIENCE', ageTier: 'AGES_10_12', topic: 'food chains and ecosystems', difficulty: 3 },
]

const AGE_GUIDES: Record<string, string> = {
  AGES_4_6:   'Ages 4–6: Very simple language. 3 questions, 2 options each.',
  AGES_7_9:   'Ages 7–9: Simple language. 4 multiple choice questions, 4 options each.',
  AGES_10_12: 'Ages 10–12: Clear explanations. 5 multiple choice questions, 4 options each.',
}

function buildPrompt(spec: LessonSpec): string {
  const qCount = spec.ageTier === 'AGES_4_6' ? 3 : spec.ageTier === 'AGES_7_9' ? 4 : 5
  const opts   = spec.ageTier === 'AGES_4_6' ? 2 : 4
  return `You are creating educational content for a children's learning game.
${AGE_GUIDES[spec.ageTier]}
Subject: ${spec.subject}, Topic: ${spec.topic}

Return ONLY a JSON object (no markdown, no extra text):
{
  "title": "Fun lesson title",
  "content": {
    "introduction": "1-2 engaging sentences",
    "concept": "Core concept in 2-3 simple sentences",
    "example": "A concrete, relatable example"
  },
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "text": "Question?",
      "options": ${JSON.stringify(Array.from({ length: opts }, (_, i) => `Option ${i + 1}`))},
      "correctAnswer": "The correct option text",
      "explanation": "Why this is correct (1 encouraging sentence)"
    }
  ]
}
Include exactly ${qCount} questions.`
}

async function generateLesson(spec: LessonSpec) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: buildPrompt(spec) }],
  })
  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  // Strip markdown code fences if present
  const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(clean)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting seed...\n')

  // Achievements
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a })
  }
  console.log(`✓ Seeded ${ACHIEVEMENTS.length} achievements`)

  // Shop items
  let shopCreated = 0
  for (const item of SHOP_ITEMS) {
    const existing = await prisma.shopItem.findFirst({ where: { name: item.name } })
    if (!existing) {
      await prisma.shopItem.create({
        data: { ...item, config: item.config as object },
      })
      shopCreated++
    }
  }
  console.log(`✓ Seeded ${shopCreated} new shop items (${SHOP_ITEMS.length} total)`)

  // Lessons
  console.log('\n📚 Generating seed lessons with Claude...\n')
  let created = 0, skipped = 0

  for (const spec of SEED_SPECS) {
    const existing = await prisma.lesson.findFirst({
      where: { subject: spec.subject, ageTier: spec.ageTier, topic: spec.topic },
    })
    if (existing) { skipped++; continue }

    try {
      console.log(`  ✨ ${spec.subject} / ${spec.ageTier} / ${spec.topic}`)
      const generated = await generateLesson(spec)
      await prisma.lesson.create({
        data: {
          subject:      spec.subject,
          ageTier:      spec.ageTier,
          difficulty:   spec.difficulty,
          topic:        spec.topic,
          title:        generated.title,
          content:      generated.content,
          questions:    generated.questions,
          safetyStatus: 'APPROVED',
          tokenReward:  spec.ageTier === 'AGES_4_6' ? 8 : spec.ageTier === 'AGES_7_9' ? 10 : 12,
        },
      })
      created++
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`  ✗ Failed: ${spec.topic}`, err)
    }
  }

  console.log(`\n✅ Seed complete! Lessons: +${created} new, ${skipped} skipped.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
