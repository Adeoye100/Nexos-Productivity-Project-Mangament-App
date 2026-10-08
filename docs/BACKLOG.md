---
tags:
  - #project/nexos
  - #backlog
  - #engineering
status: In Progress
priority: High
---

# Nexos: Restructuring & Hardening Backlog

> **Execution Rules**
> - **Epic A** must be deeply verified before migrating adapters in **Epic D**.
> - **NEX-6** is a hard blocker for **Epic B** and **Epic C**.
> - One seam, one test, one vertical slice at a time.

---

## 🛡️ Epic A: Test Coverage Foundation (TDD)
*Status: #status/in-progress | Hardening the core logic seams.*

- [x] **NEX-2:** Characterization tests — Signaling protocol
    - **AC:** Cover subscribe, publish, ping/pong, and cleanup with mocked WebSocket.
    - **Note:** *Blocked by discovered bug in `signaling.ts` line 98 (`receiver !== conn` check missing). Needs frontend optimistic UI validation before fixing.*
- [x] **NEX-3:** Characterization tests — Goal progress derivation
    - **AC:** 0 linked tasks, partial, and full completion match UI dashboards exactly.
- [x] **NEX-4:** Characterization tests — XP & leveling formulas
    - **AC:** Level curve and weekly XP-replay logic verified without side-effects.
- [x] **NEX-5:** Characterization tests — Habit streak calculation
    - **AC:** Consecutive days, gaps, and single-day streaks calculated flawlessly.

---

## 🔀 Epic B: User / Developer Interface Split
*Status: #status/blocked | Segregating workspaces for maximum leverage.*

- [x] **NEX-6:** Scope Session — Define the boundary
    - **AC:** Written architectural decision on mode-switch mechanics (Route split vs. Context toggle) and data triggers.
- [x] **NEX-7:** Implement the mode-switch mechanism
    - **AC:** Single, obvious switch action; state persists cleanly across reloads.
- [x] **NEX-8:** User Mode — Tasks + Life + Skills view
    - **AC:** Render existing contexts without introducing new data models.
- [x] **NEX-9:** User Mode — Notes & Reference Bank
    - **AC:** Extend the Prompt Library CRUD pattern for snippets and contacts.
- [x] **NEX-10:** Developer Mode — Kanban + PRs + Deadline countdown
    - **AC:** Reuse `dnd-kit` and GitHub integrations; read targets directly from Goal dates.
- [x] **NEX-11:** Developer Mode — Humanized Instruction Generator
    - **AC:** Adapt Standup Generator to output natural-language task instructions for agents/humans.

---

## 🎨 Epic C: Design System Overhaul
*Status: #status/blocked | A shift to a developer-centric, Gruvbox-inspired aesthetic.*

- [x] **NEX-12:** Define new design tokens (Warm/Gruvbox)
    - **AC:** Full token set mapped for all three themes (light/dark/warm).
- [x] **NEX-13:** Decommission Weather Dashboard
    - **AC:** Purge route, navigation entry, and unused API dependencies.
- [x] **NEX-14:** Purge background-image system
    - **AC:** Migrate app entirely to flat token palette with zero contrast regression.
- [x] **NEX-15:** Redesign Skills page
    - **AC:** Apply new token architecture.
- [x] **NEX-16:** Redesign Life Dashboard
    - **AC:** Apply new tokens; fix structural hierarchy for Goal/Level/Skills cards.
- [x] **NEX-17:** Redesign Tasks/Kanban board
    - **AC:** Apply new token architecture for a cleaner developer canvas.

---

## ☁️ Epic D: Serverless Backend Migration
*Status: #status/todo | Can run parallel to B & C once A is stable.*

- [x] **NEX-18:** Evaluate WebSocket serverless platforms
    - **AC:** Written comparison of stateful options (Cloudflare Durable Objects vs. PartyKit).
- [x] **NEX-19:** Port signaling protocol to chosen platform (Spike)
    - **AC:** Must pass the hardened NEX-2 test suite seamlessly.
- [x] **NEX-20:** Port AI chatbot proxy to serverless function
    - **AC:** Preserve existing Express route request/response contract.
- [x] **NEX-21:** Decommission the always-on backend process
    - **AC:** Slay the Node.js server. Application runs entirely via Edge/Serverless.