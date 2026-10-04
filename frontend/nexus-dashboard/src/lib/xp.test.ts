import { describe, it, expect } from 'vitest';
import {
  levelFromXp,
  xpForLevel,
  xpProgress,
  habitXpForStreak,
  TASK_XP,
  HABIT_BASE_XP,
  HABIT_STREAK_BONUS_CAP,
} from './xp';

describe('XP and Leveling Formulas (xp.ts)', () => {
  describe('levelFromXp', () => {
    it('calculates expected levels at known XP thresholds along quadratic curve', () => {
      expect(levelFromXp(0)).toBe(0);
      expect(levelFromXp(49)).toBe(0);
      expect(levelFromXp(50)).toBe(1);
      expect(levelFromXp(199)).toBe(1);
      expect(levelFromXp(200)).toBe(2);
      expect(levelFromXp(449)).toBe(2);
      expect(levelFromXp(450)).toBe(3);
      expect(levelFromXp(799)).toBe(3);
      expect(levelFromXp(800)).toBe(4);
    });

    it('handles negative XP by returning level 0', () => {
      expect(levelFromXp(-50)).toBe(0);
    });
  });

  describe('xpForLevel', () => {
    it('returns minimum total XP required for a given level', () => {
      expect(xpForLevel(0)).toBe(0);
      expect(xpForLevel(1)).toBe(50);
      expect(xpForLevel(2)).toBe(200);
      expect(xpForLevel(3)).toBe(450);
      expect(xpForLevel(4)).toBe(800);
    });

    it('returns 0 for negative level', () => {
      expect(xpForLevel(-1)).toBe(0);
    });
  });

  describe('xpProgress', () => {
    it('computes correct level progress details for XP between thresholds', () => {
      // At 100 XP: level = 1 (req 50), next level = 2 (req 200)
      const progress = xpProgress(100);
      expect(progress.level).toBe(1);
      expect(progress.currentLevelXp).toBe(50);
      expect(progress.nextLevelXp).toBe(200);
      expect(progress.intoLevel).toBe(50);
      expect(progress.remaining).toBe(100);
      expect(progress.ratio).toBeCloseTo(50 / 150, 5);
    });
  });

  describe('habitXpForStreak', () => {
    it('returns base XP for streak of 1 or lower', () => {
      expect(habitXpForStreak(0)).toBe(HABIT_BASE_XP);
      expect(habitXpForStreak(1)).toBe(HABIT_BASE_XP);
    });

    it('adds bonus XP per additional day of current streak', () => {
      expect(habitXpForStreak(2)).toBe(HABIT_BASE_XP + 1);
      expect(habitXpForStreak(5)).toBe(HABIT_BASE_XP + 4);
    });

    it('caps the streak bonus at HABIT_STREAK_BONUS_CAP', () => {
      expect(habitXpForStreak(8)).toBe(HABIT_BASE_XP + HABIT_STREAK_BONUS_CAP);
      expect(habitXpForStreak(20)).toBe(HABIT_BASE_XP + HABIT_STREAK_BONUS_CAP);
    });
  });

  describe('Weekly XP replay / range calculation logic', () => {
    it('correctly recomputes XP for tasks completed only within a specific date range', () => {
      const mockCompletedTasks = [
        { title: 'Task 1', priority: 'High' as const, completedAt: '2026-10-01T10:00:00Z' },
        { title: 'Task 2', priority: 'Medium' as const, completedAt: '2026-10-03T14:00:00Z' },
        { title: 'Task 3', priority: 'Low' as const, completedAt: '2026-09-20T10:00:00Z' }, // Outside range
      ];

      const startDate = new Date('2026-10-01T00:00:00Z');
      const endDate = new Date('2026-10-04T23:59:59Z');

      const weeklyXp = mockCompletedTasks
        .filter((t) => {
          const date = new Date(t.completedAt);
          return date >= startDate && date <= endDate;
        })
        .reduce((sum, t) => sum + TASK_XP[t.priority], 0);

      // Task 1 (High = 20) + Task 2 (Medium = 10) = 30 XP
      expect(weeklyXp).toBe(30);
    });
  });
});
