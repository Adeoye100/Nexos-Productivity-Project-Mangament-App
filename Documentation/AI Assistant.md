# AI Assistant

## Overview
A chat‑based LLM assistant that knows about your tasks, habits, weather, and can perform actions directly in the app.

## Features
- **Conversational Interface** – Talk** (powered by Google Gemini) via a chat UI.
- **Context Awareness** – The AI receives your current task list (title, priority, category, due date, completion) so it can answer questions like “What tasks are due today?” or suggest prioritization.
- **Action Execution** – Understands special `<action>` blocks to:
  - `create_task` – adds a new task with provided title, category, priority.
  - `complete_task` – marks an existing task as complete (by ID).
- **Proactive Notifications** – After each AI reply, a notification is added to the [[Notification Log]].
- **Local Chat History** – Conversations are saved to `localStorage`; clear chat or delete history via UI.
- **Quick Prompt Buttons** – One‑click examples: “What tasks are due soon?”, “Add a High priority task: review budget”, “What's the weather like today?”, etc.
- **Weather Insight** – When asked about weather, the assistant can pull data from the same backend used by the [[Weather Dashboard]].
- **Productivity Tips** – Periodic AI suggestions appear in the UI (also seen in Task Manager and Weather Dashboard).
- **Integration** – Works alongside [[Task Manager]], [[Habit Tracker]], [[Weather Dashboard]] to provide a unified experience.
- **Keyboard Friendly** – Focus the input with `/` (slash) from any Vim‑enabled component, submit with Enter.

## Related Notes
- [[Task Manager]]
- [[Habit Tracker]]
- [[Weather Dashboard]]
- [[Notification Log]]
- [[Settings Panel]]
- [[Command Manager]]
- [[Keyboard Shortcuts]]

---
*Edit this note to add more details or link to other features.*