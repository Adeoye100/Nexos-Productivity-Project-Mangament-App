# Command Manager

## Overview
A searchable, extensible repository of frequently‑used command‑line snippets (Git, SSH, Linux, Aria2c, etc.) with support for custom commands, tagging, and copy‑to‑clipboard.

## Features
- **Search** – Instant filtering by tool name, command string, description, or tags.
- **Tool Filters** – Buttons for common categories: All, Git, SSH, Aria2c, Linux, Other.
- **Command Cards** – Each entry displays:
  - Tool badge (e.g., Git)
  - Custom flag (if user‑added)
  - The command string (monospace, overflow‑aware)
  - Short description
  - Tags (if any)
  - Copy button (copies the command to clipboard)
- **Add Custom Command** – Form**
  - Fields: Tool name, Command string, Description, Tags (comma‑separated)
  - Validation: all fields required before saving
  - On save: toast notification, added to list, persisted in `localStorage`
- **Delete Custom Command** – Trash icon on custom cards removes the entry after confirmation.
- **Copy to Clipboard** – Uses the Clipboard API with a fallback to `execCommand('copy')` for older browsers; toast confirms success.
- **Persistence** – All commands (built‑in + custom) are saved in `localStorage` under a key like `nexus-commands`.
- **Responsive Grid** – 1‑column on mobile, up to 3‑column on large screens.
- **Keyboard Navigation** – Integrated with `useVimNavigation`:
  - `j/k`: move through cards
  - `Enter`: copy selected command to clipboard
  - `/`: focus search input
  - `Esc`: clear search and exit add‑form if open
- **Toast Feedback** – Success/error messages via the `use-toast` hook.
- **Accessibility** – ARIA labels, focus traps, sufficient colour contrast.

## Data Model (simplified)
```ts
interface CommandSnippet {
  id: string;          // uuid or incremental
  tool: string;        // e.g., "Git", "SSH", "Linux"
  command: string;     // the actual shell command
  description: string;
  tags?: string[];     // optional
  isCustom: boolean;   // true for user‑added entries
}
```

## Related Notes
- [[Keyboard Shortcuts]]
- [[Settings Panel]]
- [[Notification Log]]
- [[Task Manager]] (can create tasks from command output via AI)
- [[AI Assistant]] (may suggest commands)
- [[Background Manager]]
- [[Weather Dashboard]]

---
*Edit this note to add more details or link to other features.*