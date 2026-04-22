import { PrismaClient } from '@prisma/client'
import Anthropic from '@anthropic-ai/sdk'

const prisma = new PrismaClient()
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-6'

interface LessonSpec {
  subject: 'MATH' | 'READING' | 'SCIENCE'
  ageTier: 'AGES_4_6' | 'AGES_7_9' | 'AGES_10_12'
  topic: string
  difficulty: number
}

const SEED_SPECS: LessonSpec[] = [
  // MATH
  { subject: 'MATH', ageTier: 'AGES_4_6', topic: 'counting to 10', difficulty: 1 },
  { subject: 'MATH', ageTier: 'AGES_4_6', topic: 'basic shapes', difficulty: 1 },
  { subject: 'MATH', ageTier: 'AGES_7_9', topic: 'addition and subtraction', difficulty: 2 },
  { subject: 'MATH', ageTier: 'AGES_7_9', topic: 'multiplication basics', difficulty: 2 },
  { subject: 'MATH', ageTier: 'AGES_10_12', topic: 'fractions', difficulty: 3 },
  { subject: 'MATH', ageTier: 'AGES_10_12', topic: 'long division', difficulty: 4 },
  // READING
  { subject: 'READING', ageTier: 'AGES_4_6', topic: 'vowels and consonants', difficulty: 1 },
  { subject: 'READING', ageTier: 'AGES_4_6', topic: 'rhyming words', difficulty: 1 },
  { subject: 'READING', ageTier: 'AGES_7_9', topic: 'compound words', difficulty: 2 },
  { subject: 'READING', ageTier: 'AGES_7_9', topic: 'antonyms and synonyms', difficulty: 2 },
  { subject: 'READING', ageTier: 'AGES_10_12', topic: 'prefixes and suffixes', difficulty: 3 },
  { subject: 'READING', ageTier: 'AGES_10_12', topic: 'context clues', difficulty: 3 },
  // SCIENCE
  { subject: 'SCIENCE', ageTier: 'AGES_4_6', topic: 'animals and their sounds', difficulty: 1 },
  { subject: 'SCIENCE', ageTier: 'AGES_4_6', topic: 'plants and sunlight', difficulty: 1 },
  { subject: 'SCIENCE', ageTier: 'AGES_7_9', topic: 'the water cycle', difficulty: 2 },
  { subject: 'SCIENCE', ageTier: 'AGES_7_9', topic: 'states of matter', difficulty: 2 },
  { subject: 'SCIENCE', ageTier: 'AGES_10_12', topic: 'the solar system', difficulty: 3 },
  { subject: 'SCIENCE', ageTier: 'AGES_10_12', topic: 'food chains and ecosystems', difficulty: 3 },
]

const AGE_GUIDES: Record<string, string> = {
  AGES_4_6: 'Ages 4-6: Very simple language. 3 questions, 2 options each.',
  AGES_7_9: 'Ages 7-9: Simple language. 4 multiple choice questions, 4 options each.',
  AGES_10_12: 'Ages 10-12: Clear explanations. 5 multiple choice questions, 4 options each.',
}

function buildPrompt(spec: LessonSpec): string {
  const questionCount = spec.ageTier === 'AGES_4_6' ? 3 : spec.ageTier === 'AGES_7_9' ? 4 : 5
  const optionCount = spec.ageTier === 'AGES_4_6' ? 2 : 4

  return `You are creating educational content for children's learning game.

${AGE_GUIDES[spec.ageTier]}
Subject: ${spec.subject}, Topic: ${spec.topic}

Return ONLY a JSON object:
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
      "options": ${JSON.stringify(Array.from({ length: optionCount }, (_, i) => `Option ${i + 1}`))},
      "correctAnswer": "The correct option text",
      "explanation": "Why this is correct"
    }
  ]
}

Include exactly ${questionCount} questions. No markdown, just JSON.`
}

async function generateLesson(spec: LessonSpec) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: buildPrompt(spec) }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  return JSON.parse(text)
}

async function seedAchievements() {
  const achievements = [
    { key: 'first_lesson', name: 'First Steps!', description: 'Complete your first lesson', iconEmoji: '🎉', tokenReward: 20 },
    { key: 'perfect_score', name: 'Brainiac!', description: 'Get a perfect score on any lesson', iconEmoji: '🧠', tokenReward: 25 },
    { key: 'streak_3', name: 'On Fire!', description: 'Reach a 3-day learning streak', iconEmoji: '🔥', tokenReward: 15 },
    { key: 'streak_7', name: 'Week Warrior!', description: 'Reach a 7-day learning streak', iconEmoji: '⚡', tokenReward: 50 },
    { key: 'math_master', name: 'Math Master', description: 'Complete 5 math lessons', iconEmoji: '🔢', tokenReward: 30 },
    { key: 'bookworm', name: 'Bookworm', description: 'Complete 5 reading lessons', iconEmoji: '📚', tokenReward: 30 },
    { key: 'scientist', name: 'Scientist', description: 'Complete 5 science lessons', iconEmoji: '🔬', tokenReward: 30 },
    { key: 'token_100', name: 'Token Collector', description: 'Earn 100 tokens total', iconEmoji: '🪙', tokenReward: 0 },
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement,
    })
  }
  console.log(`✓ Seeded ${achievements.length} achievements`)
}

async function seedShopItems() {
  const items = [
    { name: 'Rainbow Avatar', description: 'Make your avatar shimmer with rainbow colors!', type: 'AVATAR_COLOR' as const, tokenCost: 100, config: { emoji: '🌈', color: 'rainbow' } },
    { name: 'Golden Crown', description: 'Show off your royalty!', type: 'AVATAR_ACCESSORY' as const, tokenCost: 150, config: { emoji: '👑' } },
    { name: 'Cool Shades', description: 'Too cool for school', type: 'AVATAR_ACCESSORY' as const, tokenCost: 80, config: { emoji: '😎' } },
    { name: 'Dragon Buddy', description: 'A fire-breathing friend just for you!', type: 'PET' as const, tokenCost: 300, config: { emoji: '🐲' } },
    { name: 'Unicorn Friend', description: 'Magical and wonderful!', type: 'PET' as const, tokenCost: 250, config: { emoji: '🦄' } },
    { name: 'Robot Pal', description: 'Beep boop! A robot companion!', type: 'PET' as const, tokenCost: 200, config: { emoji: '🤖' } },
    { name: 'Galaxy Background', description: 'Journey through the stars!', type: 'COSMETIC' as const, tokenCost: 500, config: { emoji: '🌌' } },
    { name: 'Party Hat', description: 'Every day is a party!', type: 'AVATAR_ACCESSORY' as const, tokenCost: 60, config: { emoji: '🎉' } },
  ]

  for (const item of items) {
    const existing = await prisma.shopItem.findFirst({ where: { name: item.name } })
    if (!existing) {
      await prisma.shopItem.create({ data: { ...item, config: item.config as object } })
    }
  }
  console.log(`✓ Seeded ${items.length} shop items`)
}

async function main() {
  console.log('🌱 Starting seed...\n')

  await seedAchievements()
  await seedShopItems()

  console.log('\n📚 Generating lessons with Claude...')
  console.log('(This may take a few minutes)\n')

  let created = 0
  let skipped = 0

  for (const spec of SEED_SPECS) {
    const existing = await prisma.lesson.findFirst({
      where: { subject: spec.subject, ageTier: spec.ageTier, topic: spec.topic },
    })

    if (existing) {
      console.log(`  ⏭  Skipping ${spec.subject}/${spec.ageTier}/${spec.topic} (exists)`)
      skipped++
      continue
    }

    try {
      console.log(`  ✨ Generating ${spec.subject}/${spec.ageTier}: ${spec.topic}...`)
      const generated = await generateLesson(spec)

      await prisma.lesson.create({
        data: {
          subject: spec.subject,
          ageTier: spec.ageTier,
          difficulty: spec.difficulty,
          topic: spec.topic,
          title: generated.title,
          content: generated.content,
          questions: generated.questions,
          safetyStatus: 'APPROVED', // seed content is pre-approved
          tokenReward: spec.ageTier === 'AGES_4_6' ? 8 : spec.ageTier === 'AGES_7_9' ? 10 : 12,
        },
      })

      created++
      // Brief delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500))
    } catch (err) {
      console.error(`  ✗ Failed: ${spec.topic}`, err)
    }
  }

  console.log(`\n✅ Seed complete! Created ${created} lessons, skipped ${skipped}.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
