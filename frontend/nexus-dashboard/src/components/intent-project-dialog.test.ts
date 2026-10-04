import { describe, it, expect, vi } from 'vitest';

vi.mock('y-indexeddb', () => ({
  IndexeddbPersistence: class {
    on() {}
  },
}));
vi.mock('y-webrtc', () => ({
  WebrtcProvider: class {
    on() {}
  },
}));

import { toPreviewTasks } from './intent-project-dialog';

describe('Frontend Intent-Based Task Validation (intent-project-dialog.tsx)', () => {
  it('maps valid raw AI tasks into IntentPreviewTask array', () => {
    const rawTasks = [
      { title: '  Design UI mockups ', priority: 'High' },
      { title: 'Implement state management', priority: 'Medium' },
      { title: 'Write unit tests', priority: 'Low' },
    ];

    const mapped = toPreviewTasks(rawTasks);
    expect(mapped).not.toBeNull();
    expect(mapped).toHaveLength(3);
    expect(mapped![0]).toMatchObject({
      title: 'Design UI mockups',
      priority: 'High',
    });
    expect(mapped![1]).toMatchObject({
      title: 'Implement state management',
      priority: 'Medium',
    });
    expect(mapped![2]).toMatchObject({
      title: 'Write unit tests',
      priority: 'Low',
    });
    expect(mapped![0].id).toBeTruthy();
  });

  it('returns null if input is not an array or empty array', () => {
    expect(toPreviewTasks([] as any)).toBeNull();
    expect(toPreviewTasks(null as any)).toBeNull();
    expect(toPreviewTasks(undefined as any)).toBeNull();
  });

  it('returns null if any task has an invalid priority', () => {
    const rawTasks = [
      { title: 'Task 1', priority: 'High' },
      { title: 'Task 2', priority: 'Critical' }, // Invalid priority
    ];
    expect(toPreviewTasks(rawTasks)).toBeNull();
  });

  it('returns null if any task title is empty or only whitespace', () => {
    const rawTasks = [
      { title: 'Task 1', priority: 'High' },
      { title: '   ', priority: 'Medium' }, // Empty title
    ];
    expect(toPreviewTasks(rawTasks)).toBeNull();
  });
});
