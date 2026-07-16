---
name: Nexus shared state architecture
description: How tasks and notifications are shared across the Nexus Dashboard app
---

# Nexus Dashboard — shared state architecture

## Decision
Tasks and notifications live in React contexts at the app root, not in local component state.

**Why:** The AI assistant needs to read and write tasks; the notification system needs to fire from multiple components (task manager, AI assistant, scheduler). Prop-drilling would require plumbing through every page component.

## Files
- `artifacts/nexus-dashboard/src/context/tasks-context.tsx` — `TasksProvider`, `useTasks()`. Persists to `localStorage` key `nexus-tasks` (migrates from old key `tasks`).
- `artifacts/nexus-dashboard/src/context/notifications-context.tsx` — `NotificationsProvider`, `useNotifications()`. Fires both in-app Sonner toasts and browser Notification API. Keeps last 50 entries in memory only (no localStorage persistence by design).

## Provider order in App.tsx
ThemeProvider > TasksProvider > NotificationsProvider > WouterRouter

## How to apply
- Any component that needs task data: `import { useTasks } from '@/context/tasks-context'`
- Any component that needs to fire a notification: `import { useNotifications } from '@/context/notifications-context'`
- Both providers must be in the tree above the component — they are both mounted in `App.tsx` above `WouterRouter`.
