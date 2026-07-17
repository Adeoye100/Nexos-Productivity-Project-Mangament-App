# Keyboard Shortcuts

## Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl` + `K` | Focus AI Assistant input (if visible) |
| `Ctrl` + `Shift` + `S` | Open Settings panel |
| `Ctrl` + `Shift` + `N` | Open Notification Log |
| `Ctrl` + `Shift` + `B` | Toggle Background Manager settings (opens the background settings pane) |
| `Esc` | Close any open modal / popup / side panel |

## Vim‑Like Navigation (in applicable modules)
Modules that use the `useVimNavigation` hook (Task Manager, Habit Tracker, AI Assistant, Command Manager, etc.) share the same movement keys:
| Key | Action |
|-----|--------|
| `j` | Move selection down |
| `k` | Move selection up |
| `Enter` | Activate selected item (edit task, start habit toggle, copy command, send AI message) |
| `Space` | Toggle state (complete task, toggle habit for today, copy command in some contexts) |
| `/` | Focus primary input (add task, add habit, AI chat input, command search) |
| `Esc` | Cancel action / close input / clear selection |

## Module‑Specific Shortcuts
### Task Manager
- While the **Add Task** input is focused:
  - `Enter` – create task
- While editing a task:
  - `Enter` – save edit
  - `Esc` – cancel edit
- In **List** view:
  - `j/k` – navigate tasks
  - `Enter` – start editing selected task
  - `Space` – toggle completion of selected task
- In **Kanban** board:
  - `j/k` – navigate columns (if column focus implemented) – currently mainly mouse drag‑and‑drop.

### Habit Tracker
- In the heatmap view:
  - `j/k` – move between habit rows (when a habit is selected)
  - `Enter` – select a habit for editing / viewing streak
  - `Space` – toggle edit mode (when a habit is selected)
  - While in edit mode and a habit selected:
    - `Enter` on a past cell – toggle that day’s completion
- In the **Today** checklist:
  - `j/k` – navigate habits
  - `Space` – toggle completion of selected habit

### AI Assistant
- When chat input is focused:
  - `Enter` – send message
  - `Up` / `Down` – navigate through message history (if implemented)
- Global `/` from any Vim‑enabled view focuses the chat input.

### Command Manager
- While the command list is focused:
  - `j/k` – navigate cards
  - `Enter` – copy selected command to clipboard
  - `/` – focus search bar
  - `c` – (if implemented) open add‑command form
  - `Del` / `Backspace` – delete selected custom command (after confirmation)

### Notification List
- When the notification sidebar is open:
  - `j/k` – scroll through notifications
  - `Enter` – mark selected as read / open details (if applicable)
  - `c` – clear all (with confirmation)
  - `r` – mark all as read

### Weather Dashboard
- `f` / `c` – toggle temperature unit (F/C) (button also clickable)
- `/` – focus city search input
- `Enter` – submit search

### Background Manager
- When settings pane is open:
  - `Tab` / `Shift`+`Tab` – navigate between controls
  - `Enter` – toggle checkbox / submit slider change (instant)
  - `Esc` – close settings pane

## Notes
- All custom shortcuts can be viewed and edited from the **Settings → Keyboard Shortcuts** panel (if implemented) or by modifying the `use-vim-navigation` hook.
- Conflicts with browser extensions should be rare; most shortcuts use `Ctrl`+`Shift` combos for global actions to avoid overriding page‑level shortcuts.
- The `/?` pattern is reserved for focusing the primary input in many contexts.

---
*Edit this note to add more details or link to other features.*