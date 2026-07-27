/** Cosmetic XP / leveling — never used for feature gating */

export const TASK_XP: Record<"Low" | "Medium" | "High", number> = {
  Low: 5,
  Medium: 10,
  High: 20,
}

export const HABIT_BASE_XP = 3
/** Extra XP per day of current streak beyond the first, capped */
export const HABIT_STREAK_BONUS_PER_DAY = 1
export const HABIT_STREAK_BONUS_CAP = 7

/**
 * level = floor(sqrt(xp / 50))
 * Level 1 at 50 XP, 2 at 200, 3 at 450, 4 at 800, …
 */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50))
}

/** Minimum total XP required to reach a given level */
export function xpForLevel(level: number): number {
  if (level <= 0) return 0
  return level * level * 50
}

export function xpProgress(xp: number): {
  level: number
  currentLevelXp: number
  nextLevelXp: number
  intoLevel: number
  remaining: number
  ratio: number
} {
  const level = levelFromXp(xp)
  const currentLevelXp = xpForLevel(level)
  const nextLevelXp = xpForLevel(level + 1)
  const intoLevel = xp - currentLevelXp
  const span = Math.max(1, nextLevelXp - currentLevelXp)
  const remaining = Math.max(0, nextLevelXp - xp)
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    intoLevel,
    remaining,
    ratio: Math.min(1, intoLevel / span),
  }
}

export function habitXpForStreak(currentStreak: number): number {
  const bonus = Math.min(
    Math.max(0, currentStreak - 1) * HABIT_STREAK_BONUS_PER_DAY,
    HABIT_STREAK_BONUS_CAP,
  )
  return HABIT_BASE_XP + bonus
}
