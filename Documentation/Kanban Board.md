# Kanban Board

## Overview
A visual board view of tasks split into three columns: **Not Started**, **In Progress**, **Completed**. Tasks can be dragged between columns to update their status.

## Features
- **Drag‑and‑Drop** – Powered by `@dnd-kit` with pointer and keyboard sensors.
- **Columns**
  - Not Started (`not_started`)
  - In Progress (`in_progress`)
  - Completed (`completed`)
- **Status Sync** – Dropping a task onto a column updates its `status` field via the tasks context (`updateTask`).
- **Drag Feedback** – While dragging, a semi‑transparent clone of the task card follows the cursor.
- **Keyboard Accessibility** – Arrow keys can move focus; `Enter` to edit; `Space` to toggle completion (if supported). The board integrates with the global Vim‑navigation hook when focused.
- **Task Card Representation** – Uses the same `<TaskCard />` component as the list view, showing title, category, priority, due date, etc.
- **Empty Column Indicator** – A droppable zone appears when a column has no tasks.
- **Persistence** – Status changes are saved to `localStorage` together with the rest of the task data.
- **Responsive Layout** – Columns shrink on narrow screens; the board becomes horizontally scrollable.
- **Integration** – When a task is marked complete via the board, a completion notification is sent to the [[Notification Log]].

## Related Notes
- [[Task Manager]]
- [[Notification Log]]
- [[Settings Panel]]
- [[Keyboard Shortcuts]]
- [[Drag‑and‑Drop Utilities]]

---
*Edit this note to add more details or link to other features.*