# Task Manager

## Overview
Central hub for creating, organizing, and tracking tasks. Supports list and Kanban board views, due dates, reminders, categories, priorities, AI‑generated suggestions, bulk export, and Vim‑style keyboard navigation.

## Features
- **Task Creation**
  - Title, category (Personal, Work, Health, Shopping, Other), priority (High, Medium, Low)
  - Optional due date and reminder (date‑time picker)
  - Add via Enter key or “Add Task” button
- **Task Editing**
  - Inline edit (double‑click or via Vim `Enter` on selected task)
  - Cancel with `Esc`
- **Completion**
  - Toggle completion via checkbox, Vim `Space`, or AI command
  - Completion triggers a “Task completed” notification
- **Due Dates & Reminders**
  - Date‑time picker for both due date and reminder
  - Automatic notifications when due or at reminder time
  - Overdue notifications after 1 hour past due (if not already notified)
- **Categories & Priorities**
  - Filter by category (buttons under the input)
  - Visual priority ordering in the list (High → Medium → Low)
- **Views**
  - **List View** – sortable by priority/completion, with Vim navigation (`j`/`k`, `Enter` to edit, `Space` to toggle)
  - **Kanban Board** – drag‑and‑drop columns: *Not Started*, *In Progress*, *Completed* (powered by `@dnd-kit`)
- **AI Suggestions**
  - Periodic productivity tip displayed above the form (random from preset list)
  - AI Assistant can also create/complete tasks via natural language (`/api/chat`)
- **Export**
  - Download all tasks as plain‑text (`tasks.txt`) with checkbox markers and metadata
- **Notifications**
  - Task due, overdue, completed, and reminder events appear in the [[Notification Log]]
  - Permission request UI (bell button) to enable browser notifications
- **Vim Navigation** (`use-vim-navigation` hook)
  - `j` / `k` – move down/up
  - `Enter` – start editing selected task
  - `Space` – toggle completion of selected task
  - `/` – focus the “Add new task” input
  - `Esc` – cancel edit / clear selection
- **Persistence**
  - Tasks stored in `localStorage` under key `tasks`
  - Survives page reloads and browser restarts
- **Accessibility**
  - ARIA labels, keyboard‑friendly controls, sufficient contrast, focus outlines
- **Integration**
  - AI Assistant can read current tasks and execute actions (`create_task`, `complete_task`)
  - Notifications feed into the [[Notification Log]]
  - Completed tasks reflected in habit streaks and stats elsewhere (e.g., habit streaks if linked)

## Data Model (simplified)
```ts
interface Task {
  id: string
  title: string
  category: string
  priority: "High" | "Medium" | "Low"
  completed: boolean
  dueDate?: Date | null
  reminderAt?: Date | null
  notified: boolean          // due‑date notification sent
  overdueNotified: boolean   // overdue notification sent
  reminderNotified: boolean  // reminder notification sent
}
```

## Related Notes
- [[Kanban Board]]
- [[AI Assistant]]
- [[Notification Log]]
- [[Settings Panel]]
- [[Keyboard Shortcuts]]
- [[Habit Tracker]]
- [[Command Manager]]
- [[Background Manager]]
- [[Weather Dashboard]]

---
*Edit this note to add more details or link to other features.*