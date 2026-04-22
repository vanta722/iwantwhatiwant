import { NextRequest, NextResponse } from 'next/server'
import { getKidSession } from '@/lib/kid-session'
import { prisma } from '@/lib/prisma'
import { anthropic, CLAUDE_MODEL } from '@/lib/anthropic'
import { checkContentSafety } from '@/lib/safety'
import { z } from 'zod'
import type { Subject, AgeTier } from '@prisma/client'
import type { GeneratedLesson } from '@/types'

const GenerateSchema = z.object({
  subject: z.enum(['MATH', 'READING', 'SCIENCE']),
  ageTier: z.enum(['AGES_4_6', 'AGES_7_9', 'AGES_10_12']),
  topic: z.string().max(100).optional(),
})

const AGE_GUIDES: Record<AgeTier, string> = {
  AGES_4_6: 'Ages 4-6: Very simple language. Short sentences. 3 true/false or 2-option questions. Relatable everyday examples.',
  AGES_7_9: 'Ages 7-9: Simple but complete sentences. 4 multiple choice questions with 4 options each. Fun examples from school life.',
  AGES_10_12: 'Ages 10-12: Clear explanations with some detail. 5 multiple choice questions with 4 options each. Can include slightly abstract concepts.',
}

const SUBJECT_TOPICS: Record<Subject, string[]> = {
  MATH: ['counting', 'addition', 'subtraction', 'multiplication', 'division', 'shapes', 'fractions', 'time', 'money', 'patterns'],
  READING: ['vowels and consonants', 'rhyming words', 'compound words', 'prefixes and suffixes', 'antonyms and synonyms', 'punctuation', 'story structure', 'main idea', 'context clues', 'summarizing'],
  SCIENCE: ['plants and photosynthesis', 'animals and habitats', 'the water cycle', 'states of matter', 'the solar system', 'weather patterns', 'food chains', 'the human body', 'rocks and minerals', 'force and motion'],
}

function buildPrompt(subject: Subject, ageTier: AgeTier, topic: string): string {
  const questionCount = ageTier === 'AGES_4_6' ? 3 : ageTier === 'AGES_7_9' ? 4 : 5
  const optionCount = ageTier === 'AGES_4_6' ? 2 : 4

  return `You are creating a fun, engaging educational lesson for a children's learning game.

${AGE_GUIDES[ageTier]}

Subject: ${subject}
Topic: ${topic}

Generate a lesson as a valid JSON object with EXACTLY this structure (no extra fields, no markdown):
{
  "title": "A fun, catchy lesson title (max 8 words)",
  "content": {
    "introduction": "1-2 engaging sentences introducing this topic in kid-friendly language",
    "concept": "The core concept explained clearly in 2-3 sentences. Use simple words.",
    "example": "A concrete, relatable, fun example a child this age would connect with"
  },
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "text": "Clear, direct question text",
      "options": ${JSON.stringify(Array.from({ length: optionCount }, (_, i) => `Option ${i + 1}`))},
      "correctAnswer": "The exact text of the correct option",
      "explanation": "Brief, encouraging explanation of why the answer is correct (1 sentence)"
    }
  ]
}

Include exactly ${questionCount} questions. Make the lesson exciting and use emojis sparingly in the content.
Respond with ONLY the JSON object, no other text.`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getKidSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { subject, ageTier, topic: requestedTopic } = GenerateSchema.parse(body)

    // Pick a random topic if none provided
    const topics = SUBJECT_TOPICS[subject]
    const topic = requestedTopic ?? topics[Math.floor(Math.random() * topics.length)]

    // Check if we already have a cached lesson for this combo
    const existing = await prisma.lesson.findFirst({
      where: { subject, ageTier, safetyStatus: 'APPROVED', topic },
      orderBy: { createdAt: 'desc' },
    })
    if (existing) return NextResponse.json({ lessonId: existing.id })

    // Generate with Claude
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: buildPrompt(subject, ageTier, topic) }],
    })

    const rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

    let generated: GeneratedLesson
    try {
      generated = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: 'AI response was not valid JSON' }, { status: 500 })
    }

    // Safety check
    const allContent = `${generated.title}\n${generated.content.introduction}\n${generated.content.concept}\n${generated.content.example}\n${generated.questions.map((q) => q.text + ' ' + q.options.join(' ')).join('\n')}`
    const safety = await checkContentSafety(allContent)

    const lesson = await prisma.lesson.create({
      data: {
        subject,
        ageTier,
        difficulty: ageTier === 'AGES_4_6' ? 1 : ageTier === 'AGES_7_9' ? 2 : 3,
        topic,
        title: generated.title,
        content: generated.content as object,
        questions: generated.questions as object[],
        safetyStatus: safety.safe ? 'APPROVED' : 'REJECTED',
        safetyNotes: safety.reason || null,
        tokenReward: ageTier === 'AGES_4_6' ? 8 : ageTier === 'AGES_7_9' ? 10 : 12,
      },
    })

    if (!safety.safe) {
      return NextResponse.json({ error: 'Generated content failed safety review. Please try again.' }, { status: 422 })
    }

    return NextResponse.json({ lessonId: lesson.id }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    console.error('[lessons/generate]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
