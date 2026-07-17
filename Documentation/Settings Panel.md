# Settings Panel

## Overview
Centralised settings for user profile, notifications, data management, and app‑wide preferences.

## Sections
### Personal Information
- **Name** – Text fields (optional) location (city, state). 
- Saved to `localStorage` as `userName` and `userLocation`.
- Used for greeting in the Weather Dashboard and potentially elsewhere.

### Preferences
- **Notifications Toggle** – Enable/disable browser notifications (used for task due/overdue/reminder, AI reply, etc.). Stored as `notifications` boolean.
  - When turned off, existing permission is not revoked; new requests are suppressed.
- Additional preference toggles can be added here (theme, sound, etc.).

### Actions
- **Save** – Persists any changes made on the page to `localStorage`. Shows a temporary “Saved!” confirmation.
- **Reset All Data** – Clears all stored data:
  - `hasOnboarded` (to show onboarding again)
  - `userName`, `userLocation`
  - `notifications`
  - `tasks`, `habits`, `habit entries`
  - `commands` (custom commands)
  - `background` settings (custom image, opacity, blur, B/W)
  - Reloads the page to start from a clean slate.

### Information Banner
- Reminds users that all data is stored locally in the browser; no data is sent to external servers.

## Persistence
All settings are stored as plain strings in `window.localStorage`. The component reads them on mount via `useEffect` and writes them on each change or on explicit Save.

## Accessibility
- Form inputs have associated `<label>` elements.
- Buttons have clear text or icon+text labels.
- The modal (if used) traps focus and returns it to the trigger on close.

## Related Notes
- [[Keyboard Shortcuts]] (shortcut to open Settings: `Ctrl`+`Shift`+`S`)
- [[Notification Log]]
- [[Task Manager]]
- [[Habit Tracker]]
- [[AI Assistant]]
- [[Command Manager]]
- [[Background Manager]]
- [[Weather Dashboard]]
- [[Dashboard Layout]]

---
*Edit this note to add more details or link to other features.*