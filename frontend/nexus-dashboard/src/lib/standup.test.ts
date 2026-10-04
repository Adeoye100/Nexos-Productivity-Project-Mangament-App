import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateStandup } from './standup';
import type { Task } from '@/context/tasks-context';
import type { HabitEntry, Habit } from '@/context/habits-context';
import type { GitHubIssue } from '@/lib/github';

describe('Standup Generator (standup.ts)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 4, 12, 0, 0)); // Oct 4, 2026, 12:00:00
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseTask = {
    category: 'Work',
    priority: 'Medium' as const,
  };

  it('returns "Nothing logged yet today" when there are no activities', () => {
    expect(generateStandup([], [], [], [])).toBe("Nothing logged yet today");
  });

  it('includes tasks completed yesterday', () => {
    const yesterday = new Date(2026, 9, 3, 15, 0, 0);
    const tasks: Task[] = [
      { ...baseTask, id: '1', title: 'Task A', status: 'completed', completed: true, createdAt: yesterday } as Task,
      { ...baseTask, id: '2', title: 'Task B', status: 'completed', completed: true, createdAt: yesterday } as Task,
    ];
    
    const output = generateStandup(tasks, [], [], []);
    
    expect(output).toContain('## Yesterday');
    expect(output).toContain('- Task A');
    expect(output).toContain('- Task B');
    expect(output).toContain('## Today');
    expect(output).toContain('- No active items today');
  });

  it('includes habits completed yesterday', () => {
    const habits: Habit[] = [{ id: 'h1', name: 'Drink Water', createdAt: new Date().toISOString() }];
    const habitEntries: HabitEntry[] = [{ habitId: 'h1', date: '2026-10-03', completed: true }];
    
    const output = generateStandup([], habitEntries, habits, []);
    
    expect(output).toContain('## Yesterday');
    expect(output).toContain('- Habit: Drink Water');
  });

  it('includes in-progress tasks today', () => {
    const tasks: Task[] = [
      { ...baseTask, id: '3', title: 'Task C', status: 'in_progress', completed: false, createdAt: new Date() } as Task,
    ];
    
    const output = generateStandup(tasks, [], [], []);
    
    expect(output).toContain('## Today');
    expect(output).toContain('- Task C (In Progress)');
  });

  it('includes habits completed today', () => {
    const habits: Habit[] = [{ id: 'h2', name: 'Exercise', createdAt: new Date().toISOString() }];
    const habitEntries: HabitEntry[] = [{ habitId: 'h2', date: '2026-10-04', completed: true }];
    
    const output = generateStandup([], habitEntries, habits, []);
    
    expect(output).toContain('## Today');
    expect(output).toContain('- Habit: Exercise (Done)');
  });

  it('includes blocked GitHub issues in the Blockers section', () => {
    const issues: GitHubIssue[] = [
      {
        id: 1,
        number: 42,
        title: 'Fix auth bug',
        state: 'open',
        html_url: '',
        created_at: '',
        updated_at: '',
        labels: [{ id: 1, name: 'blocked', color: 'red', default: false, description: '' }]
      }
    ];
    
    const output = generateStandup([], [], [], issues);
    
    expect(output).toContain('## Blockers');
    expect(output).toContain('- BLOCKED: Fix auth bug (#42)');
    expect(output).toContain('## Today');
    expect(output).toContain('- GitHub: Fix auth bug (#42)');
  });
});
