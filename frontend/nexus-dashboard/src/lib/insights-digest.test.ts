import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateDigest } from './insights-digest';
import type { Task } from '@/context/tasks-context';
import type { Goal } from '@/context/goals-context';
import type { HabitEntry } from '@/context/habits-context';
import type { TimeEntry } from '@/context/time-entries-context';

describe('Insights Digest Generator (insights-digest.ts)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 4, 12, 0, 0)); // Oct 4, 2026, 12:00:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns limited data message if less than 3 days of tracking data exist', () => {
    const tasks = [
      { createdAt: new Date(2026, 9, 4) } as Task,
      { createdAt: new Date(2026, 9, 3) } as Task,
    ];
    
    expect(generateDigest(tasks, [], [], [], [])).toBe('Limited data — only 2 days tracked so far.');
  });

  it('includes completed tasks breakdown in the digest', () => {
    const tasks: Task[] = [
      { id: '1', title: 'A', status: 'completed', completed: true, priority: 'High', createdAt: new Date(2026, 9, 1) } as Task,
      { id: '2', title: 'B', status: 'completed', completed: true, priority: 'Medium', createdAt: new Date(2026, 9, 2) } as Task,
      { id: '3', title: 'C', status: 'completed', completed: true, priority: 'Medium', createdAt: new Date(2026, 9, 3) } as Task,
      { id: '4', title: 'D', status: 'completed', completed: true, priority: 'Low', createdAt: new Date(2026, 9, 4) } as Task,
      // Older task (outside 7 days window)
      { id: '5', title: 'E', status: 'completed', completed: true, priority: 'High', createdAt: new Date(2026, 8, 20) } as Task,
    ];
    
    // Provide some extra dates to bypass the 3-day check
    const habitEntries: HabitEntry[] = [
      { habitId: 'h1', date: '2026-10-01', completed: true },
      { habitId: 'h1', date: '2026-10-02', completed: true },
      { habitId: 'h1', date: '2026-10-03', completed: true },
    ];
    
    const output = generateDigest(tasks, [], habitEntries, [], []);
    
    expect(output).toContain('Tasks completed: 4 (1 High, 2 Medium, 1 Low priority)');
  });

  it('includes time tracked breakdown', () => {
    const timeEntries: TimeEntry[] = [
      { id: 't1', date: '2026-10-02', startTime: '2026-10-02T09:00:00Z', durationMinutes: 120 } as TimeEntry, // Morning (depends on local timezone, 9am UTC)
      { id: 't2', date: '2026-10-03', startTime: '2026-10-03T14:00:00Z', durationMinutes: 60 } as TimeEntry, // Afternoon
      { id: 't3', date: '2026-10-04', startTime: '2026-10-04T20:00:00Z', durationMinutes: 180 } as TimeEntry, // Evening
    ];
    
    const output = generateDigest([], [], [], timeEntries, []);
    
    expect(output).toContain('Time tracked: 6.0 hours total.');
  });

  it('includes at-risk goals (due within 7 days, <70% progress)', () => {
    const tasks: Task[] = [
      { id: '1', goalId: 'g1', status: 'completed', completed: true, createdAt: new Date(2026, 9, 1) } as Task,
      { id: '2', goalId: 'g1', status: 'in_progress', completed: false, createdAt: new Date(2026, 9, 2) } as Task,
      { id: '3', goalId: 'g1', status: 'not_started', completed: false, createdAt: new Date(2026, 9, 3) } as Task,
      { id: '4', goalId: 'g1', status: 'not_started', completed: false, createdAt: new Date(2026, 9, 4) } as Task,
    ]; // 1 out of 4 = 25% complete
    
    const goals: Goal[] = [
      {
        id: 'g1',
        title: 'Launch Product',
        status: 'active',
        createdAt: '2026-09-01T00:00:00Z',
        targetDate: '2026-10-08T00:00:00Z', // 4 days away
      }
    ];
    
    const output = generateDigest(tasks, [], [], [], goals);
    
    expect(output).toContain('Goals nearing target date with < 70% progress:');
    expect(output).toContain('"Launch Product"');
    expect(output).toContain('25% complete');
  });

  it('formats active goals pacing correctly', () => {
    const goals: Goal[] = [
      {
        id: 'g2',
        title: 'Write Book',
        status: 'active',
        createdAt: '2026-09-04T00:00:00Z',
        targetDate: '2026-11-04T00:00:00Z',
      }
    ];
    
    const timeEntries: TimeEntry[] = [
      { id: 't1', date: '2026-10-01', startTime: '2026-10-01T00:00:00Z', durationMinutes: 1 } as TimeEntry,
      { id: 't2', date: '2026-10-02', startTime: '2026-10-02T00:00:00Z', durationMinutes: 1 } as TimeEntry,
      { id: 't3', date: '2026-10-03', startTime: '2026-10-03T00:00:00Z', durationMinutes: 1 } as TimeEntry,
    ];
    
    const output = generateDigest([], [], [], timeEntries, goals);
    
    expect(output).toContain('Active Goals Pacing:');
    expect(output).toContain('- Goal "Write Book": Created 29 days ago. No linked tasks. 32 days remaining until target date.');
  });
});
