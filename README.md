# Nexos

Nexos is a productivity and project management application designed to blend offline-first local data with real-time multi-device synchronization and AI-assisted workflows.

**Status: shelved** (2026-10-08)

## What it Demonstrates

Because the final health check failed during the `pnpm install` step (due to a dependency build failure with `@cloudflare/workerd-linux-64` in the PartyKit migration), the following features exist in code but must be considered **Implemented, not fully verified**:

*   **Offline-first data:** Powered by Yjs and IndexedDB (`y-indexeddb`), ensuring data is available without a connection.
*   **Same-device tab sync:** Utilizing `BroadcastChannel` (via `y-indexeddb`/`Yjs`) to keep multiple tabs in sync.
*   **Cross-device sync:** Powered by `y-webrtc` and a custom serverless PartyKit signaling server.
*   **Installable PWA:** Configured via `vite-plugin-pwa` for offline caching and installation.
*   **AI-assisted features:** A chatbot proxy (`/api/chat`) supporting OpenRouter and Gemini, context-aware of the user's tasks.
*   **GitHub-aware task blocking:** Kanban tasks that reference and block on GitHub PRs.
*   **Gamified Growth System:** XP, leveling, and habit streaks.
*   **User / Developer Modes:** A distinct interface boundary separating daily life tracking from deep developer workflows (Standup Generator, Notes Bank, PR tracking).

## Tech Stack & Running

*   **Frontend:** React, Vite, Tailwind CSS (Gruvbox warm tokens), Yjs.
*   **Backend:** PartyKit (Serverless Websocket & HTTP handler).
*   **Package Manager:** pnpm.

**How to run (assuming dependencies install successfully):**
1. Install dependencies: `pnpm install` (Note: requires `pnpm approve-builds` for `workerd`)
2. Configure environment: Copy `.env.example` to `.env` in both `frontend/nexus-dashboard` and `backend/partykit-server`.
3. Start the dev servers: `pnpm run dev`
4. The frontend runs on port `5173`, and the PartyKit backend runs on port `1999`.
*(Note: If using ngrok to expose the dev server, the free-tier URLs will change every session).*

## Known Limitations — NOT safe to deploy as-is

*   **Open CORS:** The backend API handles requests with `Access-Control-Allow-Origin: *`, which is insecure for production.
*   **Vite Dev Config:** `server.allowedHosts: true` is enabled in `vite.config.ts` (added for tunnel testing).
*   **Client-Side Secrets:** A GitHub PAT is likely stored or accessed client-side for the GitHub PR blocking features.
*   **No CI/CD:** There are no automated pipelines configured for testing or deployment.
*   **Exposed Secret in History:** The git history contains a real `OPENWEATHER_API_KEY` (commit `004128a`). **DO NOT MAKE THIS REPO PUBLIC** without rewriting history.
