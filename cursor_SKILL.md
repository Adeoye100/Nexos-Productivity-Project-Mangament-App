---
name: nexos-design-system
description: Use when styling any Nexos component — enforces Tailwind + CVA only, three-theme awareness, and existing UI patterns.
---

# Nexos Design System Rules

- Styling: Tailwind CSS + CVA only. Never introduce styled-components, 
  emotion, or any other CSS-in-JS library.
- Themes: every new component must be checked against all three themes 
  (light, dark, warm) — reference CSS variables from index.css, never 
  hardcode hex colors.
- Reuse existing primitives: Dialog, Popover, Card, Button already exist 
  in src/components/ui/ — check there before building a new one.
- Aesthetic direction: borderless/floating layout (shadow-based elevation, 
  not heavy borders), thinner font-weights on headers, consistent with 
  the floating UI pass already applied to task-manager.tsx / kanban-board.tsx.
- State: all interactive components must be controlled (reflect real 
  state), never defaultChecked/defaultValue-style uncontrolled patterns.
