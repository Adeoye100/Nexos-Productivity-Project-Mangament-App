---
name: Nexus AI task action protocol
description: How the AI assistant creates/completes tasks via XML action blocks
---

# Nexus AI task action protocol

## Pattern
The server embeds the user's task list in the Gemini system prompt and instructs the model to append ONE `<action>` XML block at the end of its response when the user asks it to create or complete a task.

The client (ai-assistant.tsx) strips the block, parses JSON inside it, executes the action via TasksContext, and appends a confirmation line to the displayed message.

## Action formats
```
<action>{"type":"create_task","title":"…","priority":"High|Medium|Low","category":"Personal|Work|Health|Shopping|Other"}</action>
<action>{"type":"complete_task","id":"<task_id>"}</action>
```

## Why
Clean separation: the AI response text stays human-readable; the machine-readable instruction is isolated and stripped before display. Avoids requiring structured output mode or function calling on the Gemini side.

## How to apply
If extending with new action types: add the format to the system prompt in `artifacts/api-server/src/routes/chat.ts` (`buildSystemPrompt`) and add a handler branch in the `if (actionMatch)` block in `artifacts/nexus-dashboard/src/components/ai-assistant.tsx`.
