import type { AgeTier, Subject } from '@prisma/client'

export interface AvatarConfig {
  baseColor: string
  eyeType: 'happy' | 'cool' | 'sleepy' | 'excited'
  accessory?: 'hat' | 'glasses' | 'bow' | 'crown' | null
  pet?: 'cat' | 'dog' | 'dragon' | 'unicorn' | 'robot' | null
}

export interface LessonContent {
  introduction: string
  concept: string
  example: string
}

export interface Question {
  id: string
  type: 'multiple_choice' | 'true_false'
  text: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export interface GeneratedLesson {
  title: string
  content: LessonContent
  questions: Question[]
}

export interface SafetyCheckResult {
  safe: boolean
  reason: string
}

export interface KidSessionPayload {
  kidId: string
  parentId: string
  familyCode: string
}

export interface KidContext {
  kidId: string
  parentId: string
  familyCode: string
  name: string
  tokenBalance: number
  ageTier: AgeTier
  avatarConfig: AvatarConfig
  currentStreak: number
}

export const AGE_TIER_LABELS: Record<AgeTier, string> = {
  AGES_4_6: 'Ages 4–6',
  AGES_7_9: 'Ages 7–9',
  AGES_10_12: 'Ages 10–12',
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  MATH: 'Math',
  READING: 'Reading',
  SCIENCE: 'Science',
}

export const SUBJECT_EMOJIS: Record<Subject, string> = {
  MATH: '🔢',
  READING: '📚',
  SCIENCE: '🔬',
}

export const SUBJECT_COLORS: Record<Subject, string> = {
  MATH: 'from-brand-purple to-brand-purple-light',
  READING: 'from-brand-orange to-yellow-400',
  SCIENCE: 'from-brand-green to-brand-sky',
}

export const AVATAR_COLORS: Record<string, string> = {
  purple: '#7C3AED',
  blue: '#3B82F6',
  green: '#22C55E',
  orange: '#F97316',
  pink: '#EC4899',
  yellow: '#EAB308',
}

export const AVATAR_EYES: Record<AvatarConfig['eyeType'], string> = {
  happy: '😊',
  cool: '😎',
  sleepy: '😴',
  excited: '🤩',
}

export const PET_EMOJIS: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
  dragon: '🐲',
  unicorn: '🦄',
  robot: '🤖',
}

export const ACCESSORY_EMOJIS: Record<string, string> = {
  hat: '🎩',
  glasses: '👓',
  bow: '🎀',
  crown: '👑',
}

export function ageToTier(age: number): AgeTier {
  if (age <= 6) return 'AGES_4_6'
  if (age <= 9) return 'AGES_7_9'
  return 'AGES_10_12'
}

export const TOKEN_REWARDS = {
  LESSON_COMPLETE: 10,
  PERFECT_SCORE: 50,
  STREAK_BONUS: 5,
} as const
