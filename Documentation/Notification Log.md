# Notification Log

## Overview
A centralized feed for all system alerts: task reminders, AI replies, habit streaks, weather alerts, and more.

## Features
- **Real‑time Updates** – Notifications appear instantly when triggered.
- **Types**
  - `task_due` – When a task’s due time arrives.
  - `task_overdue` – One hour past due.
  - `task_completed` – When you mark a task done.
  - `ai_reply` – After the AI assistant responds.
  - `reminder` – Custom task reminder.
- **Visual Cues** – Icons and colour‑coding per type (see source for mapping).
- **Unread Badge** – Counter of unread items shown in the notification bell.
- **Actions**
  - Mark individual or all as read.
  - Clear all notifications.
- **Persistence** – Notification history lives in `localStorage` until cleared.
- **Access** – Open via the bell icon in the top‑right corner or via the configured shortcut (see [[Keyboard Shortcuts]]).
- **Integration** – Triggered by:
  - [[Task Manager]] (due/overdue/completion)
  - [[AI Assistant]] (after each reply)
  - [[Habit Tracker]] (streak milestones – optional)
  - [[Weather Dashboard]] (alerts for severe weather – if configured)

## Related Notes
- [[Task Manager]]
- [[Habit Tracker]]
- [[AI Assistant]]
- [[Weather Dashboard]]
- [[Settings Panel]]
- [[Keyboard Shortcuts]]

---
*Edit this note to add more details or link to other features.*