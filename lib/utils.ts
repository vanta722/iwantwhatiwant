import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateFamilyCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

export function formatTokens(amount: number): string {
  return amount.toLocaleString()
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '🔥🔥🔥'
  if (streak >= 14) return '🔥🔥'
  if (streak >= 7) return '🔥'
  if (streak >= 3) return '⚡'
  return '✨'
}
