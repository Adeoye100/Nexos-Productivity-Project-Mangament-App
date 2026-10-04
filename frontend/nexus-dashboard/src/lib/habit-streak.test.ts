import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calcHabitStreaks, toDateString } from './habit-streak';

describe('Habit Streak Calculation (habit-streak.ts)', () => {
  beforeEach(() => {
    // Mock system time to a fixed date: 2026-10-04 (Sunday)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 4, 12, 0, 0)); // Oct 4, 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 0 current and 0 longest for an empty dates set', () => {
    expect(calcHabitStreaks(new Set())).toEqual({ current: 0, longest: 0 });
  });

  it('calculates 1 day current and 1 day longest for today only', () => {
    const dates = new Set(['2026-10-04']);
    expect(calcHabitStreaks(dates)).toEqual({ current: 1, longest: 1 });
  });

  it('calculates 1 day current and 1 day longest for yesterday only (today not checked yet)', () => {
    const dates = new Set(['2026-10-03']);
    expect(calcHabitStreaks(dates)).toEqual({ current: 1, longest: 1 });
  });

  it('calculates 0 current streak if last activity was 2 days ago (streak broken)', () => {
    const dates = new Set(['2026-10-02']);
    expect(calcHabitStreaks(dates)).toEqual({ current: 0, longest: 1 });
  });

  it('calculates consecutive days leading up to today', () => {
    const dates = new Set(['2026-10-02', '2026-10-03', '2026-10-04']);
    expect(calcHabitStreaks(dates)).toEqual({ current: 3, longest: 3 });
  });

  it('calculates current streak when completed up to yesterday but not today', () => {
    const dates = new Set(['2026-10-02', '2026-10-03']);
    expect(calcHabitStreaks(dates)).toEqual({ current: 2, longest: 2 });
  });

  it('correctly distinguishes best streak from active current streak across gaps', () => {
    // 5 consecutive days in September, broken streak, then 2 consecutive days ending yesterday
    const dates = new Set([
      '2026-09-10',
      '2026-09-11',
      '2026-09-12',
      '2026-09-13',
      '2026-09-14',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(calcHabitStreaks(dates)).toEqual({ current: 2, longest: 5 });
  });
});
