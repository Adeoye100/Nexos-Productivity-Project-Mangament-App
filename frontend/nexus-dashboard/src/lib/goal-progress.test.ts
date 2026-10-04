import { describe, it, expect } from 'vitest';
import { deriveGoalProgress } from './goal-progress';

describe('Goal Progress Derivation (goal-progress.ts)', () => {
  it('returns empty state when there are 0 linked tasks', () => {
    const result = deriveGoalProgress('goal-1', []);
    expect(result).toEqual({
      kind: 'empty',
      label: 'No linked tasks yet',
    });
  });

  it('returns empty state when tasks exist but none are linked to the goal', () => {
    const tasks = [
      { goalId: 'other-goal', completed: true },
      { goalId: 'other-goal-2', completed: false },
    ];
    const result = deriveGoalProgress('goal-1', tasks);
    expect(result).toEqual({
      kind: 'empty',
      label: 'No linked tasks yet',
    });
  });

  it('calculates ratio and rounded percentage for partial completion (e.g. 2 of 5 = 40%)', () => {
    const tasks = [
      { goalId: 'goal-1', completed: true },
      { goalId: 'goal-1', completed: true },
      { goalId: 'goal-1', completed: false },
      { goalId: 'goal-1', completed: false },
      { goalId: 'goal-1', completed: false },
    ];
    const result = deriveGoalProgress('goal-1', tasks);
    expect(result).toEqual({
      kind: 'ratio',
      completed: 2,
      total: 5,
      percent: 40,
      label: '2/5 tasks · 40%',
    });
  });

  it('calculates 100% when all linked tasks are complete', () => {
    const tasks = [
      { goalId: 'goal-1', completed: true },
      { goalId: 'goal-1', completed: true },
      { goalId: 'goal-1', completed: true },
    ];
    const result = deriveGoalProgress('goal-1', tasks);
    expect(result).toEqual({
      kind: 'ratio',
      completed: 3,
      total: 3,
      percent: 100,
      label: '3/3 tasks · 100%',
    });
  });

  it('rounds percentage correctly (e.g. 1 of 3 = 33%)', () => {
    const tasks = [
      { goalId: 'goal-1', completed: true },
      { goalId: 'goal-1', completed: false },
      { goalId: 'goal-1', completed: false },
    ];
    const result = deriveGoalProgress('goal-1', tasks);
    expect(result).toEqual({
      kind: 'ratio',
      completed: 1,
      total: 3,
      percent: 33,
      label: '1/3 tasks · 33%',
    });
  });
});
