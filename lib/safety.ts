import { anthropic, CLAUDE_MODEL } from './anthropic'
import type { SafetyCheckResult } from '@/types'

const SAFETY_PROMPT = `You are a strict content safety reviewer for an educational platform for children aged 4–12.

Review the following educational content and respond ONLY with a valid JSON object in this exact format:
{"safe": true, "reason": ""}
or
{"safe": false, "reason": "brief explanation of the issue"}

Flag ANY content that contains:
- Violence, threats, or scary content
- Adult themes, romance, or sexual content
- Inappropriate language or slang
- Politically divisive or charged content
- Religious or spiritual content (even mild)
- Content that could cause anxiety or nightmares in young children
- Advertising or brand names
- Personal information collection

Educational content about math, reading, science, nature, animals, history facts, and similar academic topics is generally safe.`

export async function checkContentSafety(content: string): Promise<SafetyCheckResult> {
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 200,
      system: SAFETY_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Review this educational content for children:\n\n${content}`,
        },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const parsed = JSON.parse(text.trim()) as SafetyCheckResult
    return parsed
  } catch {
    // Fail closed — if safety check errors, mark as unsafe
    return { safe: false, reason: 'Safety check failed to complete' }
  }
}
